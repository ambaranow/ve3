import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoFileService } from './video-file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HelpersService } from './helpers.service';
import { VideoObj } from '@models/video-obj';
import { VideoPlayerService } from './video-player.service';
import { ViewService } from './view.service';

@Injectable({
  providedIn: 'root'
})
export class VideoWorkService {

  worker;
  isInited = false;
  progress: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  message: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  keyFramesSubj: BehaviorSubject<SafeUrl> = new BehaviorSubject<SafeUrl>(null);
  id = String((new Date()).getTime());

  constructor(
    private sanitizer: DomSanitizer,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private viewService: ViewService,
    private helpersService: HelpersService,
  ) { }


  log(mess) {
    console.log(mess);
  }
  async init() {
    const start = (new Date()).getTime();
    const { createWorker } = window['FFmpeg'];
    this.worker = createWorker({
      corePath: '/assets/ffmpeg/ffmpeg-core.js',
      logger: (res) => {
        // this.log(res);
        // if (res.message && !res.type || res.type !== 'stderr') {
        // this.log(res.message);
        //   // this.mess += res.message + '\n';
        this.message.next(res);
        // }
      },
      progress: p => {
        let prgrs = (!p || p.ratio < 0) ? 0 : p.ratio;
        prgrs = (prgrs > 1) ? (prgrs - parseInt(prgrs, 10)) : prgrs;
        this.progress.next(Math.round(prgrs * 10000) / 100);
        this.log(p)
        // this.log(prgrs)
      },
    });
    this.isInited = true;
    await this.worker.load();
    const end = (new Date()).getTime();
    this.log('Duration init() = ' + this.helpersService.ms2TimeString(end - start));
  }

  reset() {
    this.videoFileService.setDownloadLink(undefined); // reset donwload link
    this.videoFileService.setSourcePreview(undefined);
    this.videoFileService.setTarget(undefined);
    this.videoFileService.setTargetPreview(undefined);
    this.keyFramesSubj.next([]);
    this.videoFileService.setFileInfo({});
  }

  async getFileInfo(f: VideoObj) {
    // this.log('getFileInfo')
    const start = (new Date()).getTime();
    this.reset();
    const previewFileName = this.helpersService.getSourcePreviewFileName();
    if (!this.isInited) {
      await this.init();
      // write source
    }
    await this.worker.write(f.file.name, f.file);

    let result: any = {};
    const messSubscriber = this.message.subscribe(res => {
      if (res) {
        const resObj = this.helpersService.parseMessageToJson(res.message);
        // this.log(res)
        result = {...result, ...resObj};
      }
    });
    const isCopy = this.helpersService.getExtension(f.file.name) === 'mp4' ?
                  '-c copy -async 1' : '';
    // this.log('isCopy = ' + isCopy)
    // this.log('outputFileName = ' + outputFileName)
    await this.worker.run(`
      -i ${f.file.name} \
      -hide_banner \
      -loglevel info \
      ${isCopy} \
      -y ${previewFileName}
      `);
    const { data } = await this.worker.read(previewFileName);
    const previewFile = {
      data,
      type: 'video/mp4',
      name: previewFileName
    };
    this.videoFileService.setSourcePreview(previewFile);
    this.videoFileService.setFileInfo(result);

    messSubscriber.unsubscribe();
    const end = (new Date()).getTime();
    this.log('Duration getFileInfo() = ' + this.helpersService.ms2TimeString(end - start));
    return result;
  }


  async getKeyFrames(n: number[]) {
    const start = (new Date()).getTime();
    const kfPromise = new Promise((resolve, reject) => {
      const keyFrames: SafeUrl[] = [];
      const videoEl = this.videoPlayerService.getPlayer('source');
      const canvas = document.createElement('canvas');
      const vW = videoEl.videoWidth;
      const vH = videoEl.videoHeight;
      this.log(vW + ' | ' + vH)
      canvas.width = vW;
      canvas.height = vH;
      const ctx = canvas.getContext('2d');
      let runnerIndex = 0;
      const setKeyFrame = () => {
        ctx.drawImage(videoEl, 0, 0, vW, vH);
        const src = canvas.toDataURL();
        if (src) {
          const sanSrc = this.sanitizer.bypassSecurityTrustUrl(src);
          keyFrames.push(sanSrc);
          this.keyFramesSubj.next(sanSrc);
        }
        runnerIndex++;
        if (runnerIndex < n.length) {
          setTimeout(() => {
            runner(runnerIndex);
          });
        } else {
          videoEl.removeEventListener('timeupdate', setKeyFrame);

          this.viewService.loaderOff();
          const end = (new Date()).getTime();
          this.log('Duration getKeyFrames() = ' + this.helpersService.ms2TimeString(end - start));
          resolve(keyFrames);
        }
      };
      const runner = async (i: number) => {
        this.viewService.loaderOn();
        videoEl.currentTime = n[i];
      };
      videoEl.addEventListener('timeupdate', setKeyFrame);
      videoEl.currentTime = n[runnerIndex];
      runner(runnerIndex);
    });
    return kfPromise;
  }

  async reverse(params) {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
    }
    this.videoFileService.setDownloadLink(undefined); // reset donwload link
    const n = this.videoFileService.sourceVideo.file.name;
    const inputFileName = this.helpersService.getSourceFileName(n);
    const outputFileName = this.helpersService.getTargetFileName(n);
    const targetPreviewFileName = this.helpersService.getTargetPreviewFileName();
    const outputFileType = this.videoFileService.sourceVideo.file.type;
    const noAudio = params.noAudio ? '-an' : '';
    const command = `
      -y \
      -i ${inputFileName} \
      -loglevel info \
      -vf reverse \
      ${noAudio} \
      ${outputFileName}
      `;
    // this.log(command.replace(/\s+/g, ' '))
    await this.worker.run(command.replace(/\s+/g, ' '));
    setTimeout(async () => {
      const tFile = await this.worker.read(outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.videoFileService.setTarget(targetFile);
      const isCopy = this.helpersService.getExtension(outputFileName) === 'mp4' ?
        '-c copy' : '';
      await this.worker.run(`
        -i ${outputFileName} \
        -loglevel debug \
        ${isCopy} \
        -y ${targetPreviewFileName}
      `);
      const pFile = await this.worker.read(targetPreviewFileName);
      const previewFile = {
        data: pFile.data,
        type: 'video/mp4',
        name: targetPreviewFileName
      };
      this.videoFileService.setTargetPreview(previewFile);

      const end = (new Date()).getTime();
      this.log('Duration cut() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);

  }

  async cut(params: { ss: string | number, to: string | number, t: string | number, accurate: boolean, noAudio: boolean }) {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
    }
    this.videoFileService.setDownloadLink(undefined); // reset download link
    const n = this.videoFileService.sourceVideo.file.name;
    const inputFileName = this.helpersService.getSourceFileName(n);
    const outputFileName = this.helpersService.getTargetFileName(n);
    const targetPreviewFileName = this.helpersService.getTargetPreviewFileName();
    const outputFileType = this.videoFileService.sourceVideo.file.type;
    const noAudio = params.noAudio ? '-an' : '';
    await this.worker.trim(inputFileName, outputFileName, params.ss, params.to);
    setTimeout(async () => {
      const tFile = await this.worker.read(outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.videoFileService.setTarget(targetFile);
      const isCopy = this.helpersService.getExtension(outputFileName) === 'mp4' ?
        '-c copy' : '';
      await this.worker.run(`
        -i ${outputFileName} \
        -loglevel debug \
        ${isCopy} \
        -y ${targetPreviewFileName}
      `);
      const pFile = await this.worker.read(targetPreviewFileName);
      const previewFile = {
        data: pFile.data,
        type: 'video/mp4',
        name: targetPreviewFileName
      };
      this.videoFileService.setTargetPreview(previewFile);
      const end = (new Date()).getTime();
      this.log('Duration cut() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);
  }


  async cut__(params: { ss: string | number, to: string | number, t: string | number, accurate: boolean, noAudio: boolean}) {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
    }
    this.videoFileService.setDownloadLink(undefined); // reset donwload link
    const n = this.videoFileService.sourceVideo.file.name;
    const inputFileName = this.helpersService.getSourceFileName(n);
    const outputFileName = this.helpersService.getTargetFileName(n);
    const targetPreviewFileName = this.helpersService.getTargetPreviewFileName();
    const outputFileType = this.videoFileService.sourceVideo.file.type;
    const noAudio = params.noAudio ? '-an' : '';

    // https://stackoverflow.com/questions/55866736/ffmpeg-ss-option-is-not-accurate
    // 3*AV_TIME_BASE / 23
    // https://superuser.com/questions/459313/how-to-cut-at-exact-frames-using-ffmpeg
    // fast
    let command = '';
    if (!params.accurate) {
      command = `
      -y \
      -ss ${params.ss} \
      -i ${inputFileName} \
      -to ${params.to} \
      -loglevel info \
      -c copy -async 1 \
      -avoid_negative_ts 1 \
      ${noAudio} \
      ${outputFileName}
      `;
      this.log(command.replace(/\s+/g, ' '))
      await this.worker.run(command.replace(/\s+/g, ' '));
    } else {
      // accurate
      command = `
      -y \
      -i ${inputFileName} \
      -ss ${params.ss} \
      -to ${params.to} \
      -loglevel info \
      ${noAudio} \
      ${outputFileName}
      `;
      this.log(command.replace(/\s+/g, ' '))
      await this.worker.run(command.replace(/\s+/g, ' '));
    }

    // -avoid_negative_ts 1 или -copyts
    setTimeout (async () => {
      const tFile = await this.worker.read(outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.videoFileService.setTarget(targetFile);
      const isCopy = this.helpersService.getExtension(outputFileName) === 'mp4' ?
                    '-c copy' : '';
      await this.worker.run(`
        -i ${outputFileName} \
        -loglevel debug \
        ${isCopy} \
        -y ${targetPreviewFileName}
      `);
      const pFile = await this.worker.read(targetPreviewFileName);
      const previewFile = {
        data: pFile.data,
        type: 'video/mp4',
        name: targetPreviewFileName
      };
      this.videoFileService.setTargetPreview(previewFile);

      const end = (new Date()).getTime();
      this.log('Duration cut() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);
  }
}

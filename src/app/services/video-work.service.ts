import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoFileService } from './video-file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HelpersService } from './helpers.service';
import { VideoObj } from '@models/video-obj';
import { VideoPlayerService } from './video-player.service';
import { ViewService } from './view.service';
import { AudioFileService } from './audio-file.service';
// https://gist.github.com/protrolium/e0dbd4bb0f1a396fcb55
@Injectable({
  providedIn: 'root'
})
export class VideoWorkService {

  worker;
  isInited = false;
  progress: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  message: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  keyFrameSubj: BehaviorSubject<SafeUrl> = new BehaviorSubject<SafeUrl>(null);
  keyFramesFinalSubj: BehaviorSubject<SafeUrl[]> = new BehaviorSubject<SafeUrl[]>([]);
  id = String((new Date()).getTime());

  constructor(
    private sanitizer: DomSanitizer,
    private videoFileService: VideoFileService,
    private audioFileService: AudioFileService,
    private videoPlayerService: VideoPlayerService,
    private viewService: ViewService,
    private helpersService: HelpersService,
  ) { }


  log(mess) {
    // console.log(mess);
  }
  async init() {
    const start = (new Date()).getTime();
    const { createWorker } = window['FFmpeg'];
    this.worker = createWorker({
      workerPath: '/assets/ffmpeg/worker/worker.min.js',
      corePath: '/assets/ffmpeg/ffmpeg-core.js',
      logger: (res) => {
        // this.log(res);
        // if (res.message && !res.type || res.type !== 'stderr') {
        this.log(res.message);
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
    this.keyFrameSubj.next([]);
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
          this.keyFrameSubj.next(sanSrc);
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
          this.keyFramesFinalSubj.next(keyFrames);
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
      this.log('Duration reverse() = ' + this.helpersService.ms2TimeString(end - start));
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
    const noAudio = params.noAudio ? ' -an' : '';
    await this.worker.trim(
        inputFileName,
        outputFileName,
        params.ss,
        params.to,
        `${noAudio}`);
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

  async removeAudio() {
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
    const isCopy = 
      this.helpersService.getExtension(outputFileName).toLowerCase() ===
      this.helpersService.getExtension(inputFileName).toLowerCase() ?
                                                                '-c copy' : '';
    const command = `
      -y \
      -i ${inputFileName} \
      -loglevel info \
      -an \
      ${isCopy} \
      ${outputFileName}
      `;
    // this.log(command.replace(/\s+/g, ' '));
    await this.worker.run(command.replace(/\s+/g, ' '));
    setTimeout(async () => {
      const tFile = await this.worker.read(outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.videoFileService.setTarget(targetFile);
      const isCopyP = this.helpersService.getExtension(outputFileName) === 'mp4' ?
        '-c copy' : '';
      await this.worker.run(`
        -i ${outputFileName} \
        -loglevel debug \
        ${isCopyP} \
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
      this.log('Duration removeAudio() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);
  }


  async extractAudio() {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
    }
    this.audioFileService.setDownloadLink(undefined); // reset donwload link
    const inputFileName = this.helpersService.getSourceFileName(this.videoFileService.sourceVideo.file.name);
    const outputFileName = this.videoFileService.originalFile.name + '_audio.m4a';
    const outputFileType = 'audio/aac';
    // -y \
    // -loglevel info \
    const command = `
      -i ${inputFileName} \
      -y \
      -loglevel info \
      -vn \
      -c:a aac -q:a 2 \
      -af loudnorm \
      ${outputFileName}
      `;
    // await this.worker.run('-encoders');
    this.log(command.replace(/\s+/g, ' '))
    await this.worker.run(command.replace(/\s+/g, ' '));
    setTimeout(async () => {
      const tFile = await this.worker.read(outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.audioFileService.setTarget(targetFile);
      const end = (new Date()).getTime();
      this.log('Duration extractAudio() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);
  }
}

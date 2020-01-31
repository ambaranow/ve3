import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoFileService } from './video-file.service';
import { DomSanitizer } from '@angular/platform-browser';
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
  id = String((new Date()).getTime());

  constructor(
    private sanitizer: DomSanitizer,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private viewService: ViewService,
    private helpersService: HelpersService,
  ) { }


  async init() {
    const start = (new Date()).getTime();
    const { createWorker } = window['FFmpeg'];
    this.worker = createWorker({
      corePath: '/assets/ffmpeg/ffmpeg-core.js',
      logger: (res) => {
        // console.log(res);
        // if (res.message && !res.type || res.type !== 'stderr') {
        //   // console.log(res.message);
        //   // this.mess += res.message + '\n';
        this.message.next(res);
        // }
      },
      progress: p => {
        const prgrs = (!p || p.ratio < 0 || p.ratio > 1) ? 0 : p.ratio;
        this.progress.next(Math.round(prgrs * 10000) / 100);
        // console.log(p)
        // console.log(prgrs)
      },
    });
    this.isInited = true;
    await this.worker.load();
    const end = (new Date()).getTime();
    console.log('Duration init() = ' + this.helpersService.ms2TimeString(end - start));
  }

  async getFileInfo(f: VideoObj) {
    // console.log('getFileInfo')
    const start = (new Date()).getTime();
    const previewFileName = this.helpersService.getSourcePreviewFileName();
    if (!this.isInited) {
      await this.init();
      // write source
      await this.worker.write(f.file.name, f.file);
    }
    let result: any = {};
    const messSubscriber = this.message.subscribe(res => {
      if (res) {
        const resObj = this.helpersService.parseMessageToJson(res.message);
        // console.log(res)
        result = {...result, ...resObj};
      }
    });
    const isCopy = this.helpersService.getExtension(f.file.name) === 'mp4' ?
                  '-c copy -async 1' : '';
    // console.log('isCopy = ' + isCopy)
    // console.log('outputFileName = ' + outputFileName)
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
    console.log('Duration getFileInfo() = ' + this.helpersService.ms2TimeString(end - start));
    return result;
  }


  async getKeyFrames(n: number[]) {
    const start = (new Date()).getTime();
    const keyFrames = [];
    const videoEl = this.videoPlayerService.getPlayer('source');
    const canvas = document.createElement('canvas');
    // const videoEl = video.children_[0];
    const vW = videoEl.videoWidth;
    const vH = videoEl.videoHeight;
    console.log(vW + ' | ' + vH)
    canvas.width = vW;
    canvas.height = vH;
    const ctx = canvas.getContext('2d');
    let runnerIndex = 0;
    const setKeyFrame = () => {
      ctx.drawImage(videoEl, 0, 0, vW, vH);
      const src = canvas.toDataURL();
      if (src) {
        keyFrames.push(this.sanitizer.bypassSecurityTrustUrl(src));
      }
      runnerIndex++;
      if (runnerIndex < n.length) {
        runner(runnerIndex);
      } else {
        videoEl.removeEventListener('timeupdate', setKeyFrame);
        setTimeout(() => {
          this.viewService.loaderOff();
        });
      }
    };
    videoEl.addEventListener('timeupdate', setKeyFrame);
    const runner = (i: number) => {
      this.viewService.loaderOn();
      videoEl.currentTime = n[i];
    };
    runner(runnerIndex);
    const end = (new Date()).getTime();
    console.log('Duration getKeyFrames() = ' + this.helpersService.ms2TimeString(end - start));
    return keyFrames;
  }

  async trim(params: {ss: string|number, to: string|number, t: string|number, accurate: boolean}) {
    const start = (new Date()).getTime();
    console.log(params)
    if (!this.isInited) {
      await this.init();
    }
    const n = this.videoFileService.sourceVideo.file.name;
    const inputFileName = this.helpersService.getSourceFileName(n);
    const outputFileName = this.helpersService.getTargetFileName(n);
    const targetPreviewFileName = this.helpersService.getTargetPreviewFileName();
    const outputFileType = this.videoFileService.sourceVideo.file.type;

    // let command = `
    // -y \
    // -i ${inputFileName} \
    // -force_key_frames ${params.ss},${params.to} \
    // -c copy \
    // -async 1 \
    // tmp_${outputFileName}
    // `;
    // console.log(command.replace(/\s+/g, ' '))
    // await this.worker.run(command.replace(/\s+/g, ' '));
    // command = `
    // -ss ${params.ss} \
    // -i tmp_${outputFileName} \
    // -t ${params.t} \
    // -loglevel debug \
    // -c copy \
    // -avoid_negative_ts 1
    // -async 1 \
    // -y \
    // ${outputFileName}
    // `;
    // console.log(command.replace(/\s+/g, ' '))
    // await this.worker.run(command.replace(/\s+/g, ' '));
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
      tmp_${outputFileName}
      `;
      console.log(command.replace(/\s+/g, ' '))
      await this.worker.run(command.replace(/\s+/g, ' '));
    } else {
      // accurate
      command = `
      -y \
      -ss ${params.ss} \
      -i ${inputFileName} \
      -to ${params.to} \
      -loglevel info \
      tmp_${outputFileName}
      `;
      console.log(command.replace(/\s+/g, ' '))
      await this.worker.run(command.replace(/\s+/g, ' '));
    }
    // -avoid_negative_ts 1 или -copyts
    await setTimeout (async () => {
      const tFile = await this.worker.read('tmp_' + outputFileName);
      const targetFile = {
        data: tFile.data,
        type: outputFileType,
        name: outputFileName
      };
      this.videoFileService.setTarget(targetFile);
      const isCopy = this.helpersService.getExtension(outputFileName) === 'mp4' ?
                    '-c copy' : '';
      await this.worker.run(`
        -i tmp_${outputFileName} \
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
      console.log('Duration trim() = ' + this.helpersService.ms2TimeString(end - start));
      this.progress.next(100);
    }, 1000);
  }
}

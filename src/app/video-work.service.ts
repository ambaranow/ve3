import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoFileService } from './video-file.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HelpersService } from './helpers.service';
import { VideoObj } from './video-obj';

@Injectable({
  providedIn: 'root'
})
export class VideoWorkService {

  worker;
  isInited = false;
  progress: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  message: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  id = String((new Date()).getTime());
  fileInfoSubj: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  keyFrameSubj: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
    private videoFileService: VideoFileService,
    private helpersService: HelpersService,
  ) { }


  async init() {
    const start = (new Date()).getTime();
    const { createWorker } = window['FFmpeg'];
    this.worker = createWorker({
      corePath: '/assets/ffmpeg-core.js',
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


  async getKeyFrames2(n: string[], f: VideoObj) {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
      await this.worker.write(f.file.name, f.file);
    }
    const keyFrames = [];
    for (const ss of n) {
      await this.worker.run(`
        -ss ${ss} \
        -i ${f.file.name} \
        -f image2 \
        -frames 1 \
        frame.bmp \
      `);
      const imageFile = await this.worker.read('frame.bmp');
      const type = 'image/bmp';
      const src = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([imageFile.data], { type })
        )
      );
      if (src) {
        this.keyFrameSubj.next(src);
        keyFrames.push(src);
      }
    }
    const end = (new Date()).getTime();
    console.log('Duration getKeyFrames() = ' + this.helpersService.ms2TimeString(end - start));
    return keyFrames;
  }

  async getKeyFrames(f: VideoObj) {
    const start = (new Date()).getTime();
    if (!this.isInited) {
      await this.init();
      await this.worker.write(f.file.name, f.file);
    }
    const fps = this.helpersService.getFps(this.videoFileService.getFileInfo(), 10) || 1;
    // console.log('fps = ' + fps)
    // await this.worker.run('-i ' + f.file.name + ' -loglevel info -stats -f image2 -vf fps=' + fps + ',showinfo -an out_%d.jpeg');
    // await this.worker.run(`
    //   -i ${f.file.name} \
    //   -loglevel info -stats \
    //   -f image2 \
    //   -vf fps=fps=${fps}:round=near,showinfo \
    //   -an out_%d.jpeg
    //   `);
    await this.worker.run(`
      -i ${f.file.name} \
      -loglevel info \
      -f image2 \
      -vf fps=fps=${fps} \
      out_%d.bmp
      `);
    const filemask = /out_\d*\.bmp/;
    const lsData = await this.worker.ls('.');
    const keyFrames = [];
    // console.log(lsData)
    // console.log(typeof lsData.data)
    for (const path of lsData.data) {
      if (filemask.test(path)) {
        const imageFile = await this.worker.read(path);
        const type = 'image/bmp';
        keyFrames.push(
          this.sanitizer.bypassSecurityTrustUrl(
            URL.createObjectURL(
              new Blob([imageFile.data], { type })
            )
          )
        );
      }
    }
    const end = (new Date()).getTime();
    console.log('Duration getKeyFrames() = ' + this.helpersService.ms2TimeString(end - start));
    return keyFrames;
  }

  async getFileInfo(f) {
    const start = (new Date()).getTime();
    const outputFileName = this.helpersService.getTargetFileName(f.file.name, this.id);
    if (!this.isInited) {
      await this.init();
      await this.worker.write(f.file.name, f.file);
    }
    let result: any = {};
    const messSubscriber = this.message.subscribe(res => {
      if (res) {
        const resObj = this.helpersService.parseMessageToJson(res.message);
        result = {...result, ...resObj};
        if (result.time) {
          result.durationMs = this.helpersService.timeString2ms(result.time);
        }
        this.fileInfoSubj.next(result);
      }
    });
    // await this.worker.run('--help');
    // await this.worker.run('-i ' + f.file.name + ' -hide_banner -c copy -f null -');
    // await this.worker.run('-i ' + f.file.name + ' -hide_banner -loglevel quiet -stats -c copy ' + outputFileName);
    await this.worker.run(`
      -i ${f.file.name} \
      -loglevel info \
      -c copy -y ${outputFileName}
      `);
    const {data} = await this.worker.read(outputFileName);
    const targetFile = {
      data,
      type: f.file.type,
      name: outputFileName
    };
    this.videoFileService.setTarget(targetFile);
    messSubscriber.unsubscribe();
    const end = (new Date()).getTime();
    console.log('Duration getFileInfo() = ' + this.helpersService.ms2TimeString(end - start));
    return result;
  }


  async trim(params: {start: string|number, end?: string, duration?: number}) {
    const start = (new Date()).getTime();
    // console.log(params)
    if (!this.isInited) {
      await this.init();
    }
    const inputFileName = this.videoFileService.sourceVideo.file.name;
    const outputFileName = this.videoFileService.targetVideo.file.name;
    const outputFileType = this.videoFileService.targetVideo.file.type;
    if (params.duration) {
      await this.worker.run(`
        -i ${inputFileName} \
        -ss ${params.start} \
        -t ${params.duration} \
        -loglevel info \
        -c copy -y ${outputFileName}
        `);
    }
    if (params.end) {
      await this.worker.trim(
        inputFileName,
        outputFileName,
        params.start,
        params.end);
    }
    const { data } = await this.worker.read(outputFileName);
    const targetFile = {
      data,
      type: outputFileType,
      name: outputFileName
    };
    this.videoFileService.setTarget(targetFile);
    const end = (new Date()).getTime();
    console.log('Duration trim() = ' + this.helpersService.ms2TimeString(end - start));
    this.progress.next(100);
  }
}

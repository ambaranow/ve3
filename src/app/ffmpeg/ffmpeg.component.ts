import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReadFile } from 'ngx-file-helpers';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-ffmpeg',
  templateUrl: './ffmpeg.component.html',
  styleUrls: ['./ffmpeg.component.scss']
})
export class FfmpegComponent implements OnInit {

  worker;
  isWorkerLoaded = false;
  outputMessage = '';
  running = false;
  videoData;
  mess = '';
  keyFrames = [];

  workerReady: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  @Input() afterFilePicked: BehaviorSubject <any> ;

  isReady() {
    return !this.running && this.isWorkerLoaded && this.videoData;
  }

  startRunning() {
    this.outputMessage = '';
    this.running = true;
  }
  stopRunning() {
    this.running = false;
  }

  parseArguments(text: string) {
    text = text.replace(/\s+/g, ' ');
    let args = [];
    // Allow double quotes to not split args.
    text.split('"').forEach((t: string, i: number) => {
      t = t.trim();
      if ((i % 2) === 1) {
        args.push(t);
      } else {
        args = args.concat(t.split(' '));
      }
    });
    return args;
  }

  // runCommand(text: string) {
  //   if (this.isReady()) {
  //     this.startRunning();
  //     const args = this.parseArguments(text);
  //     // console.log(args);
  //     this.worker.postMessage({
  //       type: 'command',
  //       arguments: args,
  //       files: [
  //         {
  //           name: this.getFileName(this.videoData),
  //           data: this.dataURLtoU8arr(this.videoData.content)
  //         }
  //       ]
  //     });
  //   }
  // }

  initWorker() {
    console.log(window)
    const { createWorker } = window['FFmpeg'];
    // console.log(createWorker);
    this.mess = '';
    this.worker = createWorker({
      corePath: '/assets/ffmpeg-core.js',
      logger: (res) => {
        console.log(res)
        if (res.message && !res.type || res.type !== 'stderr') {
          // console.log(res.message);
          this.mess += res.message + '\n';
        }
      },
      progress: p => console.log(p),
    });    // console.log(worker);
    const cli = async () => {
      let { name } = this.videoData;
      name = name.replace(/\s/g, '+');
      await this.worker.load();
      const videoFile = new File([this.dataURLtoU8arr(this.videoData.content)], name, { type: this.videoData.type });

      // console.log(videoFile)
      // console.log(this.videoData)
      await this.worker.write(name, videoFile);
      console.log(this.worker)
      // await this.worker.run('-filters')
      // await this.worker.run('-i ' + name + ' colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3 output.mp4');
      await this.worker.run('-i ' + name + ' -f image2 -vf fps=1,showinfo -an out_%d.jpeg');
      const filemask = /out_\d*\.jpeg/;
      const { data } = await this.worker.ls('.');
      // console.log(data)
      this.keyFrames = [];
      for (const path of data) {
        if (filemask.test(path)) {
          const imageFile = await this.worker.read(path);
          // console.log(file)
          const type = 'image/jpeg';
          // this.keyFrames.push({
          //   file: new File([file.data], path, { type }),
          //   src: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(new Blob([file.data], { type })))
          // });
          this.keyFrames.push(
            this.sanitizer.bypassSecurityTrustUrl(
              URL.createObjectURL(
                new Blob([imageFile.data], { type })
              )
            )
          );
        }
      }

      // this.isWorkerLoaded = true;
      // this.workerReady.next(null);
      // await this.worker.cli('-help');
      // await this.worker.terminate('');
    };
    cli();
  }

  dataURLtoU8arr(dataurl) {
    const arr = dataurl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
  }

  getFileName(file: ReadFile) {
    const extensionRegExp = /\.([0-9a-z]{1,5})$/i;
    const extension = file.name.match(extensionRegExp)[1];
    return 'video.' + extension.toLowerCase();
  }

  init() {
    this.afterFilePicked.subscribe((file: ReadFile) => {
      // console.log(file)
      this.videoData = file;
      if (!this.worker) {
        this.initWorker();
      }
      // this.workerReady.subscribe(() => {
      //   (async () => {
      //     await this.worker.cli('-help');
      //   })();
      //   // this.runCommand('-version')
      //   // this.runCommand('-buildconf');
      //   this.runCommand('-i ' + this.getFileName(this.videoData) + ' -f image2 -vf fps=fps=1,showinfo -an out%d.jpeg');
      // });
    });
  }

  ngOnInit() {
    // this.retrieveSampleVideo()

    this.init();
  }

}

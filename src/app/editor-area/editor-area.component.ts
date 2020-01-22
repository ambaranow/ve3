import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { VideoObj } from '../video-obj';
import { VideoFileService } from '../video-file.service';
import { VideoWorkService } from '../video-work.service';
import { HelpersService } from '../helpers.service';

@Component({
  selector: 'app-editor-area',
  templateUrl: './editor-area.component.html',
  styleUrls: ['./editor-area.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorAreaComponent implements OnInit {
  form: FormGroup;
  fileUploaded = false;
  sourceVideo: VideoObj;
  targetVideo: VideoObj;
  keyFrames = [];
  progress: number = undefined;

  constructor(
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private helpersService: HelpersService,
  ) { }

  @ViewChild('elSourceVideo', {static: false})
  // получим прямой доступ к исходному видео
  private _elSourceVideo: ElementRef;

  ngOnInit() {
    this.generateForm();
    this.videoWorkService.progress.subscribe(res => {
      if (typeof res === 'number' && (res > 0 || res < 100)) {
        this.progress = res;
      } else {
        this.progress = 0;
      }
    });
  }

  generateForm() {
    this.form = new FormGroup({
      fileCtrl: new FormControl('')
    });
  }

  async onFilePicked($event) {
    this.videoFileService.setSource($event);
    this.sourceVideo = this.videoFileService.getSource();
    this.fileUploaded = true;
    await this.videoWorkService.getFileInfo(this.sourceVideo);
    this.videoFileService.targetVideoSubj.subscribe(f => {
      this.targetVideo = null;
      setTimeout(() => {
        this.targetVideo = f;
      });
    });
    this.videoWorkService.fileInfoSubj.subscribe(async info => {
      this.videoFileService.setFileInfo(info);
      // if (info && info.durationMs) {
      //   this.videoWorkService.getKeyFrames(this.sourceVideo).then(res => {
      //     this.keyFrames = res;
      //   });
      // }
      if (info && info.durationMs) {
        const kfSubs = this.videoWorkService.keyFrameSubj.subscribe(src => {
          if (src) {
            this.keyFrames.push(src);
          }
        });
        const n = [];
        const ind = Math.round(info.durationMs / 20);
        for (let i = 0; i < info.durationMs; i++) {
          if (i % ind === 0) {
            n.push(this.helpersService.ms2TimeString(i));
          }
        }
        this.videoWorkService.getKeyFrames2(n, this.sourceVideo).then(res => {
          this.keyFrames = res;
          kfSubs.unsubscribe();
        });
      }
    });
  }

}

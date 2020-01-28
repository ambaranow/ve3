import { Component, OnInit, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { VideoWorkService } from '@services/video-work.service';
import { HelpersService } from '@services/helpers.service';
import { ViewService } from '@services/view.service';
import { Subscription } from 'rxjs';
import { VideoFileService } from '@services/video-file.service';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 've-video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoTrimmerComponent implements OnInit {

  durationMs = 0;
  trim = {
    min: 0,
    max: 0
  };
  shadowTrim = {
    min: '0',
    max: '0'
  };

  fileInfo;
  fileInfoSubs: Subscription;
  keyFrames = [];
  processKeyFrames = false;
  player = undefined;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
  ) { }


  ngOnInit() {
    this.fileInfoSubs = this.videoFileService.sourceFileInfoSubj.subscribe(info => {
      if (info && info.durationMs) {
        if (this.fileInfoSubs) {
          this.fileInfoSubs.unsubscribe();
        }
        this.durationMs = info.durationMs;
        this.trim.max = this.durationMs;
        this.init();
      }
    });
  }

  setRange($event: any, type: string) {
    switch (type) {
      case 'max':
        if (this.trim.min > this.trim.max) {
          this.trim.max = this.trim.min;
        }
        this.shadowTrim.max = 100 - (this.trim.max * 100 / this.durationMs) + '%';
        break;
      case 'min':
        if (this.trim.min > this.trim.max) {
          this.trim.min = this.trim.max;
        }
        this.shadowTrim.min = (this.trim.min * 100 / this.durationMs) + '%';
        break;
    }
  }

  shadowSize(key: string) {
    return this.shadowTrim[key];
  }

  async actionTrim() {
    this.viewService.loaderOn();
    const params = {
      // ss: this.helpersService.ms2TimeString(this.trim.min),
      // to: this.helpersService.ms2TimeString(this.trim.max),
      ss: '' + this.trim.min / 1000, // start point
      to: '' + this.trim.max / 1000, // end point
      t: '' + (this.trim.max - this.trim.min) / 1000, // duration
      frame_from: this.trim.min * this.fileInfo.fps / 1000,
      frame_to: this.trim.max * this.fileInfo.fps / 1000,
      accurate: false // https://trac.ffmpeg.org/wiki/Seeking#Notes
      // false - fast but not accurate
      // between keyframes, larger than selected
      // true - with decoding, very slowly,
      // but precisely within the selected range
    };
    await this.videoWorkService.trim(params);
    this.viewService.loaderOff();
  }


  async init() {
    if (this.processKeyFrames || !this.durationMs) {
      return;
    }
    this.processKeyFrames = true;
    const kfSubs = this.videoWorkService.keyFrameSubj.subscribe(src => {
      if (src) {
        this.viewService.loaderOn();
        this.keyFrames.push(src);
      }
    });
    const n = [];
    const ind = Math.round(this.durationMs / 10);
    for (let i = 0; i < this.durationMs; i++) {
      if (i % ind === 0) {
        n.push(this.helpersService.ms2TimeString(i));
      }
    }
    this.videoPlayerService.playerSubj.subscribe(player => {
      if (player) {
        this.player = player;
        this.videoWorkService.getKeyFrames2(n).then(res => {
          this.keyFrames = res;
        });
      }
    });
    // this.videoWorkService.getKeyFrames(n).then(res => {
    //   this.keyFrames = res;
    //   kfSubs.unsubscribe();
    //   this.fileInfo = this.videoFileService.getFileInfo();
    //   this.viewService.loaderOff();
    //   this.processKeyFrames = false;
    // });
  }
}

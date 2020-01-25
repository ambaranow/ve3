import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { VideoWorkService } from '@services/video-work.service';
import { HelpersService } from '@services/helpers.service';
import { ViewService } from '@services/view.service';
import { Subscription } from 'rxjs';

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

  fileInfoSubs: Subscription;
  keyFrames = [];
  processKeyFrames = false;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private helpersService: HelpersService,
  ) { }


  ngOnInit() {
    this.fileInfoSubs = this.videoWorkService.fileInfoSubj.subscribe(info => {
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
        this.keyFrames.push(src);
      }
    });
    const n = [];
    const ind = Math.round(this.durationMs / 1);
    for (let i = 0; i < this.durationMs; i++) {
      if (i % ind === 0) {
        n.push(this.helpersService.ms2TimeString(i));
      }
    }
    this.viewService.loaderOn();
    this.videoWorkService.getKeyFrames(n).then(res => {
      this.keyFrames = res;
      kfSubs.unsubscribe();
      this.viewService.loaderOff();
      this.processKeyFrames = false;
    });
  }
}

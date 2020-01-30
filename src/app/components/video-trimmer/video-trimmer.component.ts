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

  trim = {
    min: 0,
    max: 0,
    duration: ''
  };
  shadowTrim = {
    min: '0',
    max: '0'
  };

  fileInfo: any = {};
  fileInfoSubs: Subscription;
  keyFrames = [];
  processKeyFrames = false;
  player = undefined;
  isPaused = true;
  playProgress = {
    left: '0',
    width: '100%',
    time: 0
  };
  trimmedPlayBinded: any;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
  ) {
    this.trimmedPlayBinded = this.trimmedPlay.bind(this);
  }


  ngOnInit() {
    this.fileInfoSubs = this.videoFileService.sourceFileInfoSubj.subscribe(info => {
      if (info && info.durationMs) {
        if (this.fileInfoSubs) {
          this.fileInfoSubs.unsubscribe();
        }
        this.fileInfo = info;
        this.trim.max = this.fileInfo.durationMs || 0;
        this.init();
      }
    });
  }

  setRange($event: any, type: string, from: string) {
    if (!this.isPaused) {
      this.player.pause('source');
    }
    switch (type) {
      case 'max':
        this.trim.max = $event.value;
        if (this.trim.min > this.trim.max) {
          this.trim.max = this.trim.min;
        }
        if (this.trim.max > this.fileInfo.durationMs) {
          this.trim.max = this.fileInfo.durationMs;
        }
        this.shadowTrim.max = 100 - (this.trim.max * 100 / this.fileInfo.durationMs) + '%';
        this.videoPlayerService.currentTimeSubjs.source.next(this.trim.max / 1000);
        break;
      case 'min':
        this.trim.min = $event.value;
        if (this.trim.min > this.trim.max) {
          this.trim.min = this.trim.max;
        }
        this.shadowTrim.min = (this.trim.min * 100 / this.fileInfo.durationMs) + '%';
        this.videoPlayerService.currentTimeSubjs.source.next(this.trim.min / 1000);
        this.setPlayProgress(this.trim.min);
        break;
    }
    this.trim.duration = this.helpersService.ms2TimeString(this.trim.max - this.trim.min);
    // this.playProgress.left = (this.trim.min * 100 / this.fileInfo.durationMs) + '%';
    // this.playProgress.width = ((this.trim.max - this.trim.min) * 100 / this.fileInfo.durationMs) + '%';
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
      frame_from: this.trim.min * Math.round(this.fileInfo.fps) / 1000,
      frame_to: this.trim.max * Math.round(this.fileInfo.fps) / 1000,
      accurate: false // https://trac.ffmpeg.org/wiki/Seeking#Notes
      // false - fast but not accurate
      // between keyframes, larger than selected
      // true - with decoding, very slowly,
      // but precisely within the selected range
    };
    await this.videoWorkService.trim(params);
    this.viewService.loaderOff();
  }

  trimmedPlay() {
    this.isPaused = this.player.paused();
    const t = this.player.currentTime();
    this.setPlayProgress(t * 1000);
    if (t >= this.trim.max / 1000) {
      if (!this.isPaused) {
        this.trimmedRangePlayPause();
      }
      this.player.off('timeupdate', this.trimmedPlayBinded);
      this.videoPlayerService.currentTimeSubjs.source.next(this.trim.max / 1000);
      this.setPlayProgress(this.trim.max);
    }
  }
  trimmedPause() {
  }

  trimmedRangePlayPause() {
    console.log('this.isPaused = ' + this.isPaused)
    this.isPaused = this.player.paused();
    if (this.isPaused) {
      const t = this.player.currentTime();
      if (t < this.trim.min / 1000 || t >= this.trim.max / 1000) {
        this.videoPlayerService.currentTimeSubjs.source.next(this.trim.min / 1000);
      }
      this.player.on('timeupdate', this.trimmedPlayBinded);
      this.player.play();
    } else {
      this.isPaused = this.player.paused();
      this.player.pause('source');
    }
  }

  setPlayProgress(t) {
    this.playProgress.time = (t * 100) / this.fileInfo.durationMs;
  }

  async init() {
    if (this.processKeyFrames || !this.fileInfo.durationMs) {
      return;
    }
    const n = [];
    const ind = Math.round(this.fileInfo.durationMs / 10);
    for (let i = 0; i < this.fileInfo.durationMs; i++) {
      if (i % ind === 0) {
        n.push(Math.round(i / 1000));
      }
    }
    this.viewService.loaderOn();
    this.videoPlayerService.playerSubjs.source.subscribe(player => {
      if (player) {
        this.player = player;
        this.setRange({value: this.fileInfo.durationMs}, 'max', 'init');

        this.videoWorkService.getKeyFrames(n).then(res => {
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

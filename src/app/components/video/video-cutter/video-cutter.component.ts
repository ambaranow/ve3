import { Component, OnInit, Input, ViewEncapsulation, ElementRef, OnDestroy } from '@angular/core';
import { VideoWorkService } from '@services/video-work.service';
import { HelpersService } from '@services/helpers.service';
import { ViewService } from '@services/view.service';
import { Subscription } from 'rxjs';
import { VideoFileService } from '@services/video-file.service';
import { VideoPlayerService } from '@services/video-player.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ads-video-cutter',
  templateUrl: './video-cutter.component.html',
  styleUrls: ['./video-cutter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoCutterComponent implements OnInit, OnDestroy {

  cut = {
    min: 0,
    max: 0,
    duration: ''
  };
  shadowCut = {
    min: '0',
    max: '0'
  };

  fileInfo: any = {};
  fileInfoSubs: Subscription;
  keyFrames: SafeUrl[] = [];
  processKeyFrames = false;
  player = undefined;
  isPaused = true;
  playProgress = {
    left: '0',
    width: '100%',
    time: 0
  };
  progressBinded: any;
  subs: Subscription[] = [];
  disabled = false;
  removeAudio = false;

  cutProgress: number;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    public helpersService: HelpersService,
  ) {
    this.progressBinded = this.setPlayProgress.bind(this);
  }


  ngOnInit() {
    this.fileInfoSubs = this.videoFileService.sourceFileInfoSubj.subscribe(info => {
      if (info && info.durationMs) {
        if (this.fileInfoSubs) {
          this.fileInfoSubs.unsubscribe();
        }
        this.fileInfo = info;
        this.cut.max = this.fileInfo.durationMs || 0;
        this.init();
      }
    });
    this.subs.push(this.fileInfoSubs);
    this.subs.push(
      this.viewService.loaderSubj.subscribe(r => {
        this.disabled = r;
      })
    );
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.removeEventListener('timeupdate', this.progressBinded);
    }
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
  }

  setRange($event: any, type: string, from: string) {
    if (!this.isPaused) {
      this.player.pause('source');
    }
    switch (type) {
      case 'max':
        this.cut.max = $event.value;
        if (this.cut.max > this.fileInfo.durationMs) {
          this.cut.max = this.fileInfo.durationMs;
        }
        if (this.cut.min >= this.cut.max) {
          this.cut.min = this.cut.max - 1;
        }
        this.videoPlayerService.player.source.currentTimeSubj.next(this.cut.max / 1000);
        break;
      case 'min':
        this.cut.min = $event.value;
        if (this.cut.min >= this.cut.max) {
          this.cut.max = this.cut.min + 1;
        }
        this.videoPlayerService.player.source.currentTimeSubj.next(this.cut.min / 1000);
        break;
    }
    this.shadowCut.min = (this.cut.min * 100 / this.fileInfo.durationMs) + '%';
    this.shadowCut.max = 100 - (this.cut.max * 100 / this.fileInfo.durationMs) + '%';
    this.cut.duration = this.helpersService.ms2TimeString(this.cut.max - this.cut.min);
  }

  shadowSize(key: string) {
    return this.shadowCut[key];
  }

  changeRemoveAudio($event) {
    this.removeAudio = $event.checked;
  }

  async actionCut($event, accurate = false) {
    this.viewService.loaderOn();
    const params = {
      // ss: this.helpersService.ms2TimeString(this.cut.min),
      // to: this.helpersService.ms2TimeString(this.cut.max),
      noAudio: this.removeAudio,
      ss: '' + this.cut.min / 1000, // start point
      to: '' + this.cut.max / 1000, // end point
      t: '' + (this.cut.max - this.cut.min) / 1000, // duration
      frame_from: this.cut.min * Math.round(this.fileInfo.fps) / 1000,
      frame_to: this.cut.max * Math.round(this.fileInfo.fps) / 1000,
      accurate // https://trac.ffmpeg.org/wiki/Seeking#Notes
      // false - fast but not accurate
      // between keyframes, larger than selected
      // true - with decoding, very slowly,
      // but precisely within the selected range
    };
    this.cutProgress = 0;
    this.videoFileService.setTargetPreview(undefined);
    const tps = this.videoWorkService.progress.subscribe(v => {
      this.cutProgress = v;
    });
    this.subs.push(tps);
    await this.videoWorkService.cut(params);
    tps.unsubscribe();
    setTimeout(() => {
      this.cutProgress = 0;
    }, 2000);
    this.viewService.loaderOff();
  }


  setPlayProgress(e) {
    this.playProgress.time = (e.target.currentTime * 100) / e.target.duration;
  }

  async init() {
    if (this.processKeyFrames || !this.fileInfo.durationMs) {
      return;
    }

    this.viewService.loaderOn();
    this.subs.push(
      this.videoPlayerService.player.source.playerSubj.subscribe(player => {
        if (player) {
          this.player = player;
          this.player.addEventListener('timeupdate', this.progressBinded);
          this.setRange({value: this.fileInfo.durationMs}, 'max', 'init');
          this.videoPlayerService.player.source.currentTimeSubj.next(0);

          this.subs.push(
            this.videoWorkService.keyFramesSubj.subscribe(f => {
              if (f) {
                this.keyFrames.push(f);
              }
            })
          );
          const n = [];
          const ind = Math.round(this.fileInfo.durationMs / 10);
          for (let i = 0; i < this.fileInfo.durationMs; i++) {
            if (i % ind === 0) {
              n.push(Math.round(i / 1000));
            }
          }
          this.videoWorkService.getKeyFrames(n).then((res: SafeUrl[]) => {
            this.keyFrames = res;
            setTimeout(() => {
              this.videoPlayerService.player.source.currentTimeSubj.next(0);
            });
          });
        }
      })
    );
  }
}

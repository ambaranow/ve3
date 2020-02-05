import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { ViewService } from '@services/view.service';
import { VideoWorkService } from '@services/video-work.service';
import { VideoFileService } from '@services/video-file.service';
import { VideoPlayerService } from '@services/video-player.service';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 've-video-reverse',
  templateUrl: './video-reverse.component.html',
  styleUrls: ['./video-reverse.component.scss']
})
export class VideoReverseComponent implements OnInit, OnDestroy {

  fileInfo: any = {};
  fileInfoSubs: Subscription;
  keyFrames: SafeUrl[] = [];
  player = undefined;
  isPaused = true;
  playProgress = {
    left: '0',
    width: '100%',
    time: 0
  };
  reverseProgress = 0;
  progressBinded: any;

  isRemoveAudio = false;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
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
        this.fileInfo.duration = this.helpersService.ms2TimeString(this.fileInfo.durationMs);
        this.init();
      }
    });
  }

  ngOnDestroy() {
    this.player.removeEventListener('timeupdate', this.progressBinded);
  }

  async actionReverse($event) {
    this.viewService.loaderOn();
    this.reverseProgress = 0;
    this.videoFileService.setTargetPreview(undefined);
    const tps = this.videoWorkService.progress.subscribe(v => {
      this.reverseProgress = v;
    });
    const params = {
      noAudio: this.isRemoveAudio
    };
    await this.videoWorkService.reverse(params);
    tps.unsubscribe();
    setTimeout(() => {
      this.reverseProgress = 0;
    }, 2000);
    this.viewService.loaderOff();
  }

  setPlayProgress(e) {
    // console.log('setPlayProgress')
    // console.log(e)
    this.playProgress.time = (e.target.currentTime * 100) / e.target.duration;
  }

  setPlayerState(state) {
    this.isPaused = !state;
  }

  playerPlayPause() {
    if (this.isPaused) {
      this.videoPlayerService.play('source');
    } else {
      this.videoPlayerService.pause('source');
    }
  }

  async init() {
    if (!this.fileInfo.durationMs) {
      return;
    }


    this.viewService.loaderOn();
    this.videoPlayerService.player.source.playerSubj.subscribe(player => {
      if (player) {
        this.player = player;
        this.player.addEventListener('timeupdate', this.progressBinded);
        this.videoWorkService.keyFramesSubj.subscribe(f => {
          if (f) {
            this.keyFrames.push(f);
          }
        });
        this.videoPlayerService.player.source.playedSubj.subscribe(state => {
          this.setPlayerState(state);
        });
      }
    });
  }

}

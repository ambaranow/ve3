import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { ViewService } from '@services/view.service';
import { VideoWorkService } from '@services/video-work.service';
import { VideoFileService } from '@services/video-file.service';
import { VideoPlayerService } from '@services/video-player.service';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 'ads-video-reverse',
  templateUrl: './video-reverse.component.html',
  styleUrls: ['./video-reverse.component.scss']
})
export class VideoReverseComponent implements OnInit, OnDestroy {

  fileInfo: any = {};
  fileInfoSubs: Subscription;
  subs: Subscription[] = [];
  keyFrames: SafeUrl[] = [];
  player = undefined;
  isPaused = true;
  playProgress = {
    left: '0',
    width: '100%',
    time: 0
  };
  reverseProgress = 0;
  disabled = false;

  isRemoveAudio = false;

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
  ) {
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
    this.subs.push(this.fileInfoSubs);
    this.subs.push(
      this.viewService.loaderSubj.subscribe(r => {
        this.disabled = r;
      })
    );
  }

  ngOnDestroy() {
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
  }

  async actionReverse($event) {
    this.viewService.loaderOn();
    this.reverseProgress = 0;
    this.videoFileService.setTargetPreview(undefined);
    const tps = this.videoWorkService.progress.subscribe(v => {
      this.reverseProgress = v;
    });
    this.subs.push(tps);
    const params = {
      noAudio: this.isRemoveAudio
    };
    await this.videoWorkService.reverse(params);
    tps.unsubscribe();
    setTimeout(() => {
      this.reverseProgress = 0;
    }, 1);
    this.viewService.loaderOff();
  }

  async init() {
    if (!this.fileInfo.durationMs) {
      return;
    }
    this.viewService.loaderOn();
    this.subs.push(
      this.videoPlayerService.player.source.playerSubj.subscribe(player => {
        if (player) {
          this.player = player;
          this.viewService.loaderOff();
        }
      })
    );
    this.videoWorkService.keyFrameSubj.subscribe(f => {
      if (f) {
        this.keyFrames.push(f);
      }
    });
    this.subs.push(
      this.videoWorkService.keyFramesFinalSubj.subscribe(kfs => {
          this.keyFrames = kfs;
      })
    );
  }

}

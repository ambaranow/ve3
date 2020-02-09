import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewService } from '@services/view.service';
import { VideoFileService } from '@services/video-file.service';
import { HelpersService } from '@services/helpers.service';
import { Subscription } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 'banner-remove-audio',
  templateUrl: './remove-audio.component.html',
  styleUrls: ['./remove-audio.component.scss']
})
export class RemoveAudioComponent implements OnInit, OnDestroy {

  fileInfo: any = {};
  fileInfoSubs: Subscription;
  subs: Subscription[] = [];
  keyFrames: SafeUrl[] = [];
  disabled = false;
  removeProgress = 0;
  player = undefined;
  isPaused = true;
  playProgress = {
    left: '0',
    width: '100%',
    time: 0
  };

  constructor(
    private viewService: ViewService,
    private videoWorkService: VideoWorkService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
  ) { }

  ngOnInit(): void {
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

  init() {
    if (!this.fileInfo.durationMs) {
      return;
    }
    this.viewService.loaderOn();
    this.subs.push(
      this.videoPlayerService.player.source.playerSubj.subscribe(player => {
        if (player) {
          this.player = player;
          this.videoWorkService.keyFramesSubj.subscribe(f => {
            if (f) {
              this.keyFrames.push(f);
            }
          });
        }
      })
    );
  }

  async actionRemoveAudio() {
    this.viewService.loaderOn();
    this.removeProgress = 0;
    this.videoFileService.setTargetPreview(undefined);
    const tps = this.videoWorkService.progress.subscribe(v => {
      this.removeProgress = v;
    });
    this.subs.push(tps);
    await this.videoWorkService.removeAudio();
    tps.unsubscribe();
    setTimeout(() => {
      this.removeProgress = 0;
    }, 1);
    this.viewService.loaderOff();
  }

}

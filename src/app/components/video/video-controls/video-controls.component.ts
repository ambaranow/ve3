import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { VideoPlayerService } from '@services/video-player.service';
import { Subscription } from 'rxjs';
import { HelpersService } from '@services/helpers.service';

@Component({
  selector: 've-video-controls',
  templateUrl: './video-controls.component.html',
  styleUrls: ['./video-controls.component.scss']
})
export class VideoControlsComponent implements OnInit, OnDestroy {

  player = undefined;
  isPaused = true;
  playedSubj: Subscription;
  timeUpdateBinded;

  constructor(
    private videoPlayerService: VideoPlayerService,
    private helpersService: HelpersService,
  ) {
    this.timeUpdateBinded = this.timeUpdate.bind(this);
  }

  @Input()
  duration?: string;

  @Input()
  start?: number;

  @Input()
  end?: number;

  @Input()
  preview: string;

  setPlayerState(state) {
    this.isPaused = !state;
  }

  timeUpdate(e) {
    const t = e.target.currentTime;
    if (this.end && t >= this.end / 1000) {
      if (!this.isPaused) {
        this.videoPlayerService.player[this.preview].currentTimeSubj.next(this.end / 1000);
        this.controlPlayPause();
      }
    }
  }

  controlPlayPause() {
    if (!this.player) {
      return;
    }
    if (this.isPaused) {
      if (!isNaN(this.start) && !isNaN(this.end)) {
        const t = this.player.currentTime * 1000;
        if (t < this.start || t >= this.end) {
          this.videoPlayerService.player[this.preview].currentTimeSubj.next(this.start / 1000);
        }
      }
      this.player.addEventListener('timeupdate', this.timeUpdateBinded);
      this.videoPlayerService.play(this.preview);
    } else {
      this.player.removeEventListener('timeupdate', this.timeUpdateBinded);
      this.videoPlayerService.pause(this.preview);
    }
  }

  init() {
    if (this.preview) {
      this.videoPlayerService.player[this.preview].playerSubj.subscribe(player => {
        this.player = player;
        if (this.playedSubj) {
          this.playedSubj.unsubscribe();
        }
        if (this.player) {
          if (!this.duration) {
            this.videoPlayerService.player[this.preview].durationSubj.subscribe(duration => {
              this.duration = this.helpersService.ms2TimeStringNoMs(duration * 1000);
            });
          }
          this.playedSubj = this.videoPlayerService.player[this.preview].playedSubj.subscribe(state => {
            this.setPlayerState(state);
          });
        }
      });
    }
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {

  }
}

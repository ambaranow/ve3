import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 've-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoPreviewComponent implements OnInit, OnDestroy {

  previewVideo: VideoObj;
  player;
  subs: Subscription[] = [];
  duration: number = undefined;
  progress: number = undefined;

  setPlayerBinded;
  setDurationBinded;
  timeUpdateBinded;


  @Input() id: 'source' | 'target';
  @Input() controls = true;

  constructor(
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
  ) {
    this.setPlayerBinded = this.setPlayer.bind(this);
    this.setDurationBinded = this.setDuration.bind(this);
    this.timeUpdateBinded = this.timeUpdate.bind(this);
  }

  @ViewChild('videoEl', {static: false})
  private videoParent: ElementRef;

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
    if (this.player) {
      this.player.removeEventListener('loadeddata', this.setPlayerBinded);
      this.player.removeEventListener('durationchange', this.setDurationBinded);
      this.player.removeEventListener('timeupdate', this.timeUpdateBinded);
    }
    this.reset();
  }

  timeUpdate(e) {
    const t = e.target.currentTime;
    this.progress = t * 100 / this.duration;
    // console.log('timeUpdate ' + t + ' | duration' + this.duration + ' | progress ' + this.progress)
  }


  setPlayer() {
    if (!this.player) {
      return;
    }
    this.videoPlayerService.setPlayer(this.player, this.id);
    this.subs.push(
      this.videoPlayerService.player[this.id].currentTimeSubj
        .pipe(debounceTime(1))
        .subscribe(t => {
          this.player.currentTime = t;
        })
    );
  }

  setDuration(e) {
    if (!this.player) {
      return;
    }
    const duration = e.target.duration;
    this.duration = duration
    this.videoPlayerService.player[this.id].durationSubj.next(duration);
  }

  reset() {
    // reset player
    this.videoPlayerService.pause(this.id);
    this.videoPlayerService.setPlayer(undefined, this.id);
    this.videoPlayerService.player[this.id].durationSubj.next(undefined);
    this.player = undefined;
    this.previewVideo = null;
    this.duration = undefined;
    this.progress = undefined;
    this.videoPlayerService.player[this.id].currentTimeSubj.next(0);
  }

  init() {
    this.subs.push(
      this.videoFileService[this.id + 'PreviewVideoSubj'].subscribe(f => {
        if (this.player) {
          this.reset();
        }
        setTimeout(() => {
          this.previewVideo = f;
          if (f && f.src) {
            setTimeout(() => {
              this.player = this.videoParent.nativeElement.querySelector('video');
              if (this.player) {
                this.player.addEventListener('durationchange', this.setDurationBinded);
                this.player.addEventListener('loadeddata', this.setPlayerBinded);
                this.player.addEventListener('timeupdate', this.timeUpdateBinded);
                this.subs.push(
                  this.videoPlayerService.volumeSubj.subscribe(vol => {
                    this.player.volume = vol;
                  })
                );
              }
            }, 1);
          }
        }, 1);
      })
    );
    // this.subs.push(
    //   this.videoWorkService.progress.subscribe(res => {
    //     if (typeof res === 'number' && (res > 0 || res < 100)) {
    //       this.progress = res;
    //     } else {
    //       this.progress = 0;
    //     }
    //   })
    // );
  }
}

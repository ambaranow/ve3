import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VideoPlayerService } from '@services/video-player.service';
import { ViewService } from '@services/view.service';
import { VideoWorkService } from '@services/video-work.service';

@Component({
  selector: 'ads-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoPreviewComponent implements OnInit, OnDestroy {

  previewVideo: VideoObj;
  player;
  playerInited = false;
  subs: Subscription[] = [];
  duration: number = undefined;
  progress: number = undefined;

  loadStartBinded;
  setPlayerBinded;
  setDurationBinded;
  timeUpdateBinded;
  pauseEventBinded;


  @Input() id: 'source' | 'target';
  @Input() controls = true;

  constructor(
    private viewService: ViewService,
    private videoFileService: VideoFileService,
    private videoPlayerService: VideoPlayerService,
    private videoWorkService: VideoWorkService,
  ) {
    this.loadStartBinded = this.loadStart.bind(this);
    this.setPlayerBinded = this.setPlayer.bind(this);
    this.setDurationBinded = this.setDuration.bind(this);
    this.timeUpdateBinded = this.timeUpdate.bind(this);
    this.pauseEventBinded = this.pauseEvent.bind(this);
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
      // TODO в reset???
      this.player.removeEventListener('loadeddata', this.setPlayerBinded);
      this.player.removeEventListener('durationchange', this.setDurationBinded);
      this.player.removeEventListener('timeupdate', this.timeUpdateBinded);
      this.player.removeEventListener('pause', this.pauseEventBinded);
    }
    this.reset();
  }

  timeUpdate(e) {
    const t = e.target.currentTime;
    this.progress = t * 100 / this.duration;
  }

  pauseEvent(e) {
    if (!this.player) {
      return;
    }
    this.videoPlayerService.pause(this.id);
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
    this.playerInited = true;
    this.viewService.loaderOff();
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
    this.videoPlayerService.reset(this.id);
    this.player = undefined;
    this.previewVideo = null;
    this.duration = undefined;
    this.progress = undefined;
  }

  loadStart() {
    // началась загрузка файла
    this.viewService.loaderOn();
    setTimeout(() => {
      if (!this.playerInited) {
        // проигрыватель не получил metadata и не ответил в течение 10 сек.
        // наверное, битый mp4, пересоберем его
        this.previewVideo = undefined
        this.videoWorkService.progress.subscribe(res => {
          this.progress = res;
        })
        this.videoWorkService.getFileInfo(this.videoFileService.getSource(), true).then(r => {
          this.viewService.loaderOff();
        }).finally(() => {
        });
      }
    }, 10000);
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
                // this.player.addEventListener('error', () => {
                //   console.log('>>> error')
                // });
                // this.player.addEventListener('stalled', () => {
                //   console.log('>>> stalled')
                // });
                // this.player.addEventListener('suspend', () => {
                //   console.log('>>> suspend')
                // });
                // this.player.addEventListener('waiting', () => {
                //   console.log('>>> waiting')
                // });
                // this.player.addEventListener('abort', () => {
                //   console.log('>>> abort')
                // });
                // this.player.addEventListener('encrypted', () => {
                //   console.log('>>> encrypted')
                // });
                // this.player.addEventListener('loadstart', () => {
                //   console.log('>>> loadstart')
                // });
                this.player.addEventListener('loadstart', this.loadStartBinded);
                this.player.addEventListener('durationchange', this.setDurationBinded);
                this.player.addEventListener('loadedmetadata', this.setPlayerBinded);
                this.player.addEventListener('timeupdate', this.timeUpdateBinded);
                this.player.addEventListener('pause', this.pauseEventBinded);
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
  }
}

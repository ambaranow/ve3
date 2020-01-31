import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 've-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit, OnDestroy {

  previewVideo: VideoObj;
  player;
  previewVideoSubs: Subscription[] = [];
  progress: number = undefined;

  @Input() id: 'source'|'target';

  constructor(
    private sanitizer: DomSanitizer,
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private videoPlayerService: VideoPlayerService,
  ) { }

  @ViewChild('videoEl', {static: false})
  private videoParent: ElementRef;

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    for (const subs of this.previewVideoSubs) {
      subs.unsubscribe();
    }
    if (this.player) {
      // this.player.dispose();
      this.player.removeEventListener('loadeddata');
    }
  }

  init() {
    this.previewVideoSubs.push(
      this.videoFileService[this.id + 'PreviewVideoSubj'].subscribe(f => {
        // console.log(this.id + 'PreviewVideoSubj')
        // console.log(f)
        if (this.player) {
          // reset player
          this.player = undefined;
          this.previewVideo = null;
          this.videoPlayerService.setPlayer(undefined, this.id);
        }
        setTimeout(() => {
          this.previewVideo = f;
          if (f && f.src) {
            setTimeout(() => {
              this.player = this.videoParent.nativeElement.querySelector('video');
              if (this.player) {
                this.player.addEventListener('loadeddata', () => {
                  this.videoPlayerService.setPlayer(this.player, this.id);
                  this.videoPlayerService.currentTimeSubjs[this.id]
                    .pipe(debounceTime(20))
                    .subscribe(t => {
                      this.player.currentTime = t;
                    });
                });
              }
            }, 1);
          }
        }, 1);
        /*
        if (f && f.src) {
          if (!this.player) {
            setTimeout(() => {
              this.player = window['videojs'](
                    this.id + 'PreviewVideoPlayer',
                    {
                      controls: this.id === 'target',
                      autoplay: false,
                      preload: 'true',
                      sources: [
                        {
                          src: this.sanitizer.sanitize(4, f.src),
                          type: f.type
                        }
                      ]
                    },
                    () => {
                      this.player.on('loadedmetadata', () => {
                        const playPromise = this.player.play();
                        if (playPromise !== undefined) {
                          playPromise.then(() => {
                            this.player.pause();
                            this.player.currentTime(0);
                            setTimeout(() => {
                              this.videoPlayerService.setPlayer(this.player, this.id);
                            });
                            // Automatic playback started!
                            // Show playing UI.
                          })
                          .catch(error => {
                            // Auto-play was prevented
                            // Show paused UI.
                          });
                        }
                      });
                      this.videoPlayerService.currentTimeSubjs[this.id]
                        .pipe(debounceTime(20))
                        .subscribe(t => {
                          this.player.currentTime(t);
                        });
                    });
              console.log(this.player)
              }, 1);
            }
        }
        */
      })
    );
    this.previewVideoSubs.push(
      this.videoWorkService.progress.subscribe(res => {
        if (typeof res === 'number' && (res > 0 || res < 100)) {
          this.progress = res;
        } else {
          this.progress = 0;
        }
      })
    );
  }
}

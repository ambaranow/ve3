import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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

  downloadHref: SafeUrl = undefined;

  @Input() id: 'source' | 'target';
  @Input() downloadLink: boolean;

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
      this.player.removeEventListener('loadeddata');
    }
  }

  init() {
    if (this.downloadLink) {
      this.previewVideoSubs.push(
        this.videoFileService[this.id + 'VideoSubj'].subscribe(f => {
          if (f && f.src) {
            this.downloadHref = f.src;
          } else {
            this.downloadHref = undefined;
          }
        })
      );
    }
    this.previewVideoSubs.push(
      this.videoFileService[this.id + 'PreviewVideoSubj'].subscribe(f => {
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
                    .pipe(debounceTime(10))
                    .subscribe(t => {
                      this.player.currentTime = t;
                    });
                });
              }
            }, 1);
          }
        }, 1);
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

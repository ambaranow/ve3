import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 've-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit, OnDestroy {

  previewVideo: VideoObj;
  previewVideoSubs: Subscription[] = [];
  progress: number = undefined;

  constructor(
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private videoPlayerService: VideoPlayerService,
  ) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    for (const subs of this.previewVideoSubs) {
      subs.unsubscribe();
    }
  }

  init() {
    this.previewVideoSubs.push(
      this.videoFileService.previewVideoSubj.subscribe(f => {
        console.log(f)
        this.previewVideo = null;
        // console.log(this.previewVideo)
        setTimeout(() => {
          this.previewVideo = f;
          if (f && f.src) {
            setTimeout(() => {
              const player = window['videojs']('previewVideoPlayer', {}, () => {
                this.videoPlayerService.setPlayer(player);
              });
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

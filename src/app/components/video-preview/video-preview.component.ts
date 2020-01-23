import { Component, OnInit, OnDestroy } from '@angular/core';
import { VideoFileService } from '@services/video-file.service';
import { VideoObj } from '@models/video-obj';
import { Subscription } from 'rxjs';

@Component({
  selector: 've-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss']
})
export class VideoPreviewComponent implements OnInit, OnDestroy {

  previewVideo: VideoObj;
  previewVideoSubs: Subscription;

  constructor(
    private videoFileService: VideoFileService,
  ) { }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.previewVideoSubs.unsubscribe();
  }

  init() {
    this.previewVideoSubs = this.videoFileService.previewVideoSubj.subscribe(f => {
      this.previewVideo = f;
    });
  }
}

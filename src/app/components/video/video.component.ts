import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { VideoObj } from '@models/video-obj';
import { ViewService } from '@services/view.service';
import { VideoFileService } from '@services/video-file.service';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoComponent implements OnInit {
  form: FormGroup;
  fileUploaded = false;
  sourceVideo: VideoObj;
  targetVideo: VideoObj;
  keyFrames = [];
  progress: number = undefined;
  isPreviewReady = false;
  isTargetReady = false;

  constructor(
    private viewService: ViewService,
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private videoPlayerService: VideoPlayerService,
  ) { }

  ngOnInit() {
    this.generateForm();
    this.videoWorkService.progress.subscribe(res => {
      if (typeof res === 'number' && (res > 0 || res < 100)) {
        this.progress = res;
      } else {
        this.progress = 0;
      }
    });
    this.videoPlayerService.player.source.playerSubj.subscribe(player => {
      this.isPreviewReady = player ? true : false;
    });
    this.videoFileService.targetPreviewVideoSubj.subscribe(f => {
      this.isTargetReady = f && f.src ? true : false;
    });

  }

  generateForm() {
    this.form = new FormGroup({
      fileCtrl: new FormControl('')
    });
  }

  onFilePicked($event) {
    this.viewService.loaderOn();
    this.fileUploaded = true;
    this.videoFileService.setSource($event);
    this.videoWorkService.getFileInfo(this.videoFileService.getSource()).then(r => {
      this.viewService.loaderOff();
    }).finally(() => {
    });
  }

  volumeChange($event) {
    this.videoPlayerService.setVolume($event.value);
  }
}

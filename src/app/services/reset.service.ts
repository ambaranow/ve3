import { Injectable } from '@angular/core';
import { VideoFileService } from './video-file.service';
import { AudioFileService } from './audio-file.service';
import { VideoPlayerService } from './video-player.service';
import { VideoWorkService } from './video-work.service';

@Injectable({
  providedIn: 'root'
})
export class ResetService {

  constructor(
    private videoFileService: VideoFileService,
    private audioFileService: AudioFileService,
    private videoPlayerService: VideoPlayerService,
    private videoWorkService: VideoWorkService,
  ) { }

  resetAll() {
    this.videoWorkService.keyFramesFinalSubj.next([]);
    this.videoWorkService.keyFrameSubj.next(undefined);

    this.videoFileService.fileUploaded = false;
    this.videoFileService.setSource(undefined);
    this.videoFileService.setSourcePreview(undefined);
    this.videoFileService.setTarget(undefined);
    this.videoFileService.setTargetPreview(undefined);
    this.videoFileService.setDownloadLink(undefined);
    this.videoFileService.originalFile = null;
    this.videoFileService.setFileInfo({});

    this.audioFileService.setSource(undefined);
    this.audioFileService.setSourcePreview(undefined);
    this.audioFileService.setTarget(undefined);
    this.audioFileService.setTargetPreview(undefined);
    this.audioFileService.setDownloadLink(undefined);
    this.audioFileService.originalFile = null;

    for (const key in this.videoPlayerService.player) {
      if (this.videoPlayerService.player.hasOwnProperty(key)) {
        this.videoPlayerService.reset(key);
      }
    }
  }
}

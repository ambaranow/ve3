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

    this.videoWorkService.reset();
    // this.videoFileService.reset(); // сбрасывается в videoWorkService.reset()
    this.audioFileService.reset();

    for (const key in this.videoPlayerService.player) {
      if (this.videoPlayerService.player.hasOwnProperty(key)) {
        this.videoPlayerService.reset(key);
      }
    }
  }
}

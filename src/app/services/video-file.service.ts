import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoObj } from '@models/video-obj';
import { DomSanitizer } from '@angular/platform-browser';
import { ReadFile } from 'ngx-file-helpers';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class VideoFileService {

  sourceVideo: VideoObj;
  sourceVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  sourcePreviewVideo: VideoObj;
  sourcePreviewVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  targetVideo: VideoObj;
  targetVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  targetPreviewVideo: VideoObj;
  targetPreviewVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);

  sourceFileInfo;
  sourceFileInfoSubj: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
    private helpersService: HelpersService,
  ) { }

  getSource() {
    return this.sourceVideo;
  }

  getSourcePreview() {
    return this.sourcePreviewVideo;
  }

  getTarget() {
    return this.targetVideo;
  }

  getTargetPreview() {
    return this.sourcePreviewVideo;
  }

  setSource(sourceVideo: ReadFile) {
    this.sourceVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(sourceVideo.content),
      file: new File(
        [this.dataURLtoU8arr(sourceVideo.content)],
        this.helpersService.getSourceFileName(sourceVideo.name),
        { type: sourceVideo.type }
        ),
      type: sourceVideo.type
    };
    this.sourceVideoSubj.next(this.sourceVideo);
  }

  setSourcePreview(sourcePreviewVideo: { data: any; type: string; name?: string; }) {
    this.sourcePreviewVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([sourcePreviewVideo.data], { type: sourcePreviewVideo.type })
        )
      ),
      file: new File([sourcePreviewVideo.data], this.helpersService.getSourcePreviewFileName(), { type: sourcePreviewVideo.type }),
      type: sourcePreviewVideo.type
    };
    this.sourcePreviewVideoSubj.next(this.sourcePreviewVideo);
  }

  setTarget(targetVideo: { data: any; type: string; name?: string; }) {
    this.targetVideo = targetVideo ? {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([targetVideo.data], { type: targetVideo.type })
        )
      ),
      file: new File([targetVideo.data], this.helpersService.getTargetFileName(targetVideo.name), { type: targetVideo.type }),
      type: targetVideo.type
    } : undefined;
    this.targetVideoSubj.next(this.targetVideo);
  }

  setTargetPreview(targetPreviewVideo: { data: any; type: string; name?: string; }) {
    this.targetPreviewVideo = targetPreviewVideo ? {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([targetPreviewVideo.data], { type: targetPreviewVideo.type })
        )
      ),
      file: new File([targetPreviewVideo.data], this.helpersService.getTargetPreviewFileName(), { type: targetPreviewVideo.type }),
      type: targetPreviewVideo.type
    } : undefined;
    this.targetPreviewVideoSubj.next(this.targetPreviewVideo);
  }

  getFileInfo() {
    return this.sourceFileInfo;
  }

  setFileInfo(info: any) {
    if (info.time) {
      info.durationMs = this.helpersService.timeString2ms(info.time);
      if (!isNaN(info.frame)) {
        info.fps = this.helpersService.getFps({
          time: this.helpersService.timeString2ms(info.time),
          frames: info.frame
        });
      }
    }
    this.sourceFileInfo = info;
    this.sourceFileInfoSubj.next(this.sourceFileInfo);
  }

  dataURLtoU8arr(dataurl: string) {
    const arr = dataurl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
  }

}

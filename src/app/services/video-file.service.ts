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
  targetVideo: VideoObj;
  targetVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  previewVideo: VideoObj;
  previewVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);

  sourceFileInfo;
  sourceFileInfoSubj: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
    private helpersService: HelpersService,
  ) { }

  getSource() {
    return this.sourceVideo;
  }

  getTarget() {
    return this.targetVideo;
  }

  getView() {
    return this.previewVideo;
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

  setTarget(targetVideo: { data: any; type: string; name?: string; }) {
    this.targetVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([targetVideo.data], { type: targetVideo.type })
        )
      ),
      file: new File([targetVideo.data], this.helpersService.getTargetFileName(targetVideo.name), { type: targetVideo.type }),
      type: targetVideo.type
    };
    this.targetVideoSubj.next(this.targetVideo);
  }

  setPreview(previewVideo: { data: any; type: string; name?: string; }) {
    this.previewVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([previewVideo.data], { type: previewVideo.type })
        )
      ),
      file: new File([previewVideo.data], this.helpersService.getPreviewFileName(), { type: previewVideo.type }),
      type: previewVideo.type
    };
    this.previewVideoSubj.next(this.previewVideo);
  }

  getFileInfo() {
    return this.sourceFileInfo;
  }

  setFileInfo(info: any) {
    if (!info.fps || parseInt(info.fps, 10) === 0) {
      // try to set fps
      if (!isNaN(info.frame) && info.time) {
        info.fps = Math.round(info.frame / (this.helpersService.timeString2ms(info.time) / 1000));
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

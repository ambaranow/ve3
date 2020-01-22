import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoObj } from './video-obj';
import { DomSanitizer } from '@angular/platform-browser';
import { ReadFile } from 'ngx-file-helpers';

@Injectable({
  providedIn: 'root'
})
export class VideoFileService {

  sourceVideo: VideoObj;
  sourceVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  targetVideo: VideoObj;
  targetVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  sourceFileInfo;

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  getFileName(f) {
    const { name } = f;
    return name.replace(/\s/g, '+');
  }

  getSource() {
    return this.sourceVideo;
  }

  getTarget() {
    return this.targetVideo;
  }

  setSource(sourceVideo: ReadFile) {
    this.sourceVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(sourceVideo.content),
      file: new File([this.dataURLtoU8arr(sourceVideo.content)], this.getFileName(sourceVideo), { type: sourceVideo.type }),
      type: sourceVideo.type
    };
    this.sourceVideoSubj.next(this.sourceVideo);
  }

  setTarget(targetVideo) {
    this.targetVideo = {
      src: this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(
          new Blob([targetVideo.data], { type: targetVideo.type })
        )
      ),
      file: new File([targetVideo.data], this.getFileName(targetVideo), { type: targetVideo.type }),
      type: targetVideo.type
    };
    this.targetVideoSubj.next(this.targetVideo);
  }

  getFileInfo() {
    return this.sourceFileInfo;
  }
  setFileInfo(info) {
    this.sourceFileInfo = info;
  }

  dataURLtoU8arr(dataurl) {
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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VideoObj } from '@models/video-obj';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReadFile } from 'ngx-file-helpers';
import { HelpersService } from './helpers.service';

@Injectable({
  providedIn: 'root'
})
export class VideoFileService {

  originalFile: {
    name: string,
    ext: string,
    type: string
  }
  sourceVideo: VideoObj;
  sourceVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  sourcePreviewVideo: VideoObj;
  sourcePreviewVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  targetVideo: VideoObj;
  targetVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  targetPreviewVideo: VideoObj;
  targetPreviewVideoSubj: BehaviorSubject<VideoObj> = new BehaviorSubject<VideoObj>(null);
  downloadLinkSubj: BehaviorSubject<{src:SafeUrl,fileName:string}> = new BehaviorSubject<{src:SafeUrl,fileName:string}>(undefined);

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
    // console.log(sourceVideo.name)
    if (sourceVideo) {
      const parsedOriginalFileName = this.helpersService.parseFileName(sourceVideo.name);
      this.originalFile = {
        name: parsedOriginalFileName.name,
        ext: parsedOriginalFileName.ext,
        type: sourceVideo.type
      }
      this.sourceVideo = {
        src: this.sanitizer.bypassSecurityTrustUrl(sourceVideo.content),
        src_: sourceVideo.content,
        file: new File(
          [this.dataURLtoU8arr(sourceVideo.content)],
          this.helpersService.getSourceFileName(sourceVideo.name),
          { type: sourceVideo.type }
          ),
        type: sourceVideo.type
      };
      this.sourceVideoSubj.next(this.sourceVideo);
    }
  }

  setSourcePreview(sourcePreviewVideo: { data: any; type: string; name?: string; }) {
    if (!sourcePreviewVideo) {
      this.sourcePreviewVideo = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([sourcePreviewVideo.data], { type: sourcePreviewVideo.type })
      );
      this.sourcePreviewVideo = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([sourcePreviewVideo.data], this.helpersService.getSourcePreviewFileName(), { type: sourcePreviewVideo.type }),
        type: sourcePreviewVideo.type
      };
    }
    this.sourcePreviewVideoSubj.next(this.sourcePreviewVideo);
  }

  setTarget(targetVideo: { data: any; type: string; name?: string; }) {
    if (!targetVideo) {
      this.targetVideo = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([targetVideo.data], { type: targetVideo.type })
      );
      this.targetVideo = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([targetVideo.data], this.helpersService.getTargetFileName(targetVideo.name), { type: targetVideo.type }),
        type: targetVideo.type
      };
    }
    this.targetVideoSubj.next(this.targetVideo);
    this.setDownloadLink(targetVideo);
  }

  setDownloadLink(targetVideo) {
    if (targetVideo) {
      const fileName = this.originalFile.name + '.' + this.helpersService.getExtension(targetVideo.name);
      const dwnld = {src: this.targetVideo.src, fileName};
      this.downloadLinkSubj.next(dwnld);
    } else {
      this.downloadLinkSubj.next(undefined);
    }
  }

  setTargetPreview(targetPreviewVideo: { data: any; type: string; name?: string; }) {
    if (!targetPreviewVideo) {
      this.targetPreviewVideo = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([targetPreviewVideo.data], { type: targetPreviewVideo.type })
      );
      this.targetPreviewVideo = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([targetPreviewVideo.data], this.helpersService.getTargetPreviewFileName(), { type: targetPreviewVideo.type }),
        type: targetPreviewVideo.type
      };
    }
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

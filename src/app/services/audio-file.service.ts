import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AudioObj } from '@models/audio-obj';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ReadFile } from 'ngx-file-helpers';
import { HelpersService } from './helpers.service';
import { VideoFileService } from './video-file.service';

@Injectable({
  providedIn: 'root'
})
export class AudioFileService {

  originalFile: {
    name: string,
    ext: string,
    type: string
  }
  sourceAudio: AudioObj;
  sourceAudioSubj: BehaviorSubject<AudioObj> = new BehaviorSubject<AudioObj>(null);
  sourcePreviewAudio: AudioObj;
  sourcePreviewAudioSubj: BehaviorSubject<AudioObj> = new BehaviorSubject<AudioObj>(null);
  targetAudio: AudioObj;
  targetAudioSubj: BehaviorSubject<AudioObj> = new BehaviorSubject<AudioObj>(null);
  targetPreviewAudio: AudioObj;
  targetPreviewAudioSubj: BehaviorSubject<AudioObj> = new BehaviorSubject<AudioObj>(null);
  downloadLinkSubj: BehaviorSubject<{src:SafeUrl,fileName: string}> = new BehaviorSubject<{src:SafeUrl,fileName:string}>(undefined);

  sourceFileInfo;
  sourceFileInfoSubj: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private sanitizer: DomSanitizer,
    private helpersService: HelpersService,
    private videoFileService: VideoFileService,
  ) { }

  getSource() {
    return this.sourceAudio;
  }

  getSourcePreview() {
    return this.sourcePreviewAudio;
  }

  getTarget() {
    return this.targetAudio;
  }

  getTargetPreview() {
    return this.sourcePreviewAudio;
  }

  setSource(sourceAudio: ReadFile) {
    // console.log(sourceAudio.name)
    if (sourceAudio) {
      const parsedOriginalFileName = this.helpersService.parseFileName(sourceAudio.name);
      this.originalFile = {
        name: parsedOriginalFileName.name,
        ext: parsedOriginalFileName.ext,
        type: sourceAudio.type
      }
      this.sourceAudio = {
        src: this.sanitizer.bypassSecurityTrustUrl(sourceAudio.content),
        src_: sourceAudio.content,
        file: new File(
          [this.dataURLtoU8arr(sourceAudio.content)],
          this.helpersService.getSourceFileName(sourceAudio.name),
          { type: sourceAudio.type }
        ),
        type: sourceAudio.type
      };
      this.sourceAudioSubj.next(this.sourceAudio);
    }
  }

  setSourcePreview(sourcePreviewAudio: { data: any; type: string; name?: string; }) {
    if (!sourcePreviewAudio) {
      this.sourcePreviewAudio = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([sourcePreviewAudio.data], { type: sourcePreviewAudio.type })
      );
      this.sourcePreviewAudio = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([sourcePreviewAudio.data], this.helpersService.getSourcePreviewFileName(), { type: sourcePreviewAudio.type }),
        type: sourcePreviewAudio.type
      };
    }
    this.sourcePreviewAudioSubj.next(this.sourcePreviewAudio);
  }

  setTarget(targetAudio: { data: any; type: string; name?: string; }) {
    if (!targetAudio) {
      this.targetAudio = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([targetAudio.data], { type: targetAudio.type })
      );
      this.targetAudio = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([targetAudio.data], this.helpersService.getTargetFileName(targetAudio.name), { type: targetAudio.type }),
        type: targetAudio.type
      };
    }
    this.targetAudioSubj.next(this.targetAudio);
    this.setDownloadLink(targetAudio);
  }

  setDownloadLink(targetAudio) {
    if (targetAudio) {
      const fileName = this.videoFileService.originalFile.name + '.' + this.helpersService.getExtension(targetAudio.name);
      const dwnld = { src: this.targetAudio.src, fileName };
      this.downloadLinkSubj.next(dwnld);
    } else {
      this.downloadLinkSubj.next(undefined);
    }
  }

  setTargetPreview(targetPreviewAudio: { data: any; type: string; name?: string; }) {
    if (!targetPreviewAudio) {
      this.targetPreviewAudio = undefined;
    } else {
      const src = URL.createObjectURL(
        new Blob([targetPreviewAudio.data], { type: targetPreviewAudio.type })
      );
      this.targetPreviewAudio = {
        src: this.sanitizer.bypassSecurityTrustUrl(src),
        src_: src,
        file: new File([targetPreviewAudio.data], this.helpersService.getTargetPreviewFileName(), { type: targetPreviewAudio.type }),
        type: targetPreviewAudio.type
      };
    }
    this.targetPreviewAudioSubj.next(this.targetPreviewAudio);
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

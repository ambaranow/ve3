import { Component, OnInit, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { VideoFileService } from '@services/video-file.service';

@Component({
  selector: 'app-download-link',
  templateUrl: './download-link.component.html',
  styleUrls: ['./download-link.component.scss']
})
export class DownloadLinkComponent implements OnInit {
  downloadHref: SafeUrl = undefined;
  downloadName: string = undefined;

  constructor(
    private videoFileService: VideoFileService,
  ) { }

  ngOnInit() {
    this.videoFileService.downloadLinkSubj.subscribe(f => {
      if (f && f.src) {
        this.downloadHref = f.src;
        this.downloadName = f.fileName
      } else {
        this.downloadHref = undefined;
        this.downloadName = undefined;
      }
    });
  }

}

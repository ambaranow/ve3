import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { VideoWorkService } from '../video-work.service';
import { HelpersService } from '../helpers.service';

@Component({
  selector: 'app-video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoTrimmerComponent implements OnInit {

  durationMs = 0;
  trim = {
    min: 0,
    max: 0
  };
  shadowTrim = {
    min: '0',
    max: '0'
  };

  constructor(
    private videoWorkService: VideoWorkService,
    private helpersService: HelpersService,
  ) { }

  @Input()
  fileInfo;

  @Input()
  keyFrames;

  ngOnInit() {
    this.videoWorkService.fileInfoSubj.subscribe(info => {
      if (info && info.durationMs) {
        this.durationMs = info.durationMs;
        this.trim.max = this.durationMs;
      }
    });
  }

  setRange($event: any, type: string) {
    switch (type) {
      case 'max':
        if (this.trim.min > this.trim.max) {
          this.trim.max = this.trim.min;
        }
        this.shadowTrim.max = 100 - (this.trim.max * 100 / this.durationMs) + '%';
        break;
      case 'min':
        if (this.trim.min > this.trim.max) {
          this.trim.min = this.trim.max;
        }
        this.shadowTrim.min = (this.trim.min * 100 / this.durationMs) + '%';
        break;
    }
  }

  shadowSize(key: string) {
    return this.shadowTrim[key];
  }

  async actionTrim() {
    const params = {
      // start: this.helpersService.ms2TimeString(this.trim.min),
      // end: this.helpersService.ms2TimeString(this.trim.max),
      start: this.trim.min / 1000,
      duration: (this.trim.max - this.trim.min) / 1000
    };
    await this.videoWorkService.trim(params);
  }
}

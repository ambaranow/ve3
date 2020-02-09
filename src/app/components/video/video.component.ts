import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ViewService } from '@services/view.service';
import { VideoFileService } from '@services/video-file.service';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';
import { Subscription } from 'rxjs';
import { MetaService } from '@services/meta.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  form: FormGroup;
  fileUploaded = false;
  progress: number = undefined;
  isPreviewReady = false;
  isTargetReady = false;
  subs: Subscription[] = [];
  disabled = false;

  constructor(
    private viewService: ViewService,
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private videoPlayerService: VideoPlayerService,
    private metaService: MetaService,
    private translateService: TranslateService,
  ) { }

  ngOnChanges() {
  }

  ngOnInit() {
    this.generateForm();
    this.subs.push(
      this.videoWorkService.progress.subscribe(res => {
        if (typeof res === 'number' && (res > 0 || res < 100)) {
          this.progress = res;
        } else {
          this.progress = 0;
        }
      })
    );
    this.subs.push(
      this.videoPlayerService.player.source.playerSubj.subscribe(player => {
        this.isPreviewReady = player ? true : false;
      })
    );
    this.subs.push(
      this.videoFileService.targetPreviewVideoSubj.subscribe(f => {
        this.isTargetReady = f && f.src ? true : false;
      })
    );
    this.subs.push(
      this.viewService.loaderSubj.subscribe(r => {
        this.disabled = r;
      })
    );

    // this.subs.push(
    //   this.translateService.get('VIDEOPAGE.PAGETITLE', { value: 'world' }).subscribe((res: string) => {
    //     this.metaService.setMeta({ pageTitle: res });
    //   })
    // );
  }

  ngAfterViewInit() {
  }


  ngOnDestroy() {
    this.metaService.setMeta(undefined);
    // console.log('VideoComponent destroy')
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
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

import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ViewService } from '@services/view.service';
import { VideoFileService } from '@services/video-file.service';
import { VideoWorkService } from '@services/video-work.service';
import { VideoPlayerService } from '@services/video-player.service';
import { Subscription } from 'rxjs';
import { MetaService } from '@services/meta.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '@components/localize-router/localize-router.service';
import { SafeUrl } from '@angular/platform-browser';
import { ResetService } from '@services/reset.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  form: FormGroup;
  progress: number = undefined;
  isPreviewReady = false;
  isTargetReady = false;
  subs: Subscription[] = [];
  disabled = false;
  navLinks: any[];
  activeLinkIndex = -1;
  fileInfo: any = {};
  fileInfoSubs: Subscription;

  constructor(
    private viewService: ViewService,
    private videoFileService: VideoFileService,
    private videoWorkService: VideoWorkService,
    private videoPlayerService: VideoPlayerService,
    private metaService: MetaService,
    private router: Router,
    private resetService: ResetService,
    private localize: LocalizeRouterService,
    private translateService: TranslateService,
  ) { }

  ngOnChanges() {
  }

  ngOnInit() {
    this.navLinks = [
      {
          label: 'BUTTONS.CUTFRAGMENT',
          link: '/video/cut',
          index: 0
      }, {
          label: 'BUTTONS.EXTRACTAUDIO',
          link: '/video/extract-audio',
          index: 1
        }, {
          label: 'BUTTONS.REVERSE',
          link: '/video/reverse',
          index: 2
        }, {
          label: 'BUTTONS.REMOVEAUDIO',
          link: '/video/remove-audio',
          index: 3
      },
    ];
    this.router.events.subscribe((res) => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });
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
        if (player) {
          this.fileInfoSubs = this.videoFileService.sourceFileInfoSubj.subscribe(info => {
            if (info && info.durationMs) {
              if (this.fileInfoSubs) {
                this.fileInfoSubs.unsubscribe();
              }
              this.fileInfo = info;
              this.getKeyFrames();
            }
          });
          this.subs.push(this.fileInfoSubs);
        }
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

  getKeyFrames() {
    const n = [];
    const ind = Math.round(this.fileInfo.durationMs / 10);
    for (let i = 0; i < this.fileInfo.durationMs; i++) {
      if (i % ind === 0) {
        n.push(Math.floor(i / 1000));
      }
    }
    this.videoWorkService.getKeyFrames(n).then((res: SafeUrl[]) => {
      // this.keyFrames = res;
      setTimeout(() => {
        this.videoPlayerService.player.source.currentTimeSubj.next(0);
      });
    });
  }

  ngOnDestroy() {
    this.metaService.setMeta(undefined);
    // console.log('VideoComponent destroy')
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
    // this.viewService.loaderOff();
    this.resetService.resetAll();
  }


  generateForm() {
    this.form = new FormGroup({
      fileCtrl: new FormControl('')
    });
  }

  fileUploaded(){
    return this.videoFileService.fileUploaded;
  };

  onFilePicked($event) {
    this.viewService.loaderOn();
    this.videoFileService.fileUploaded = true;
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

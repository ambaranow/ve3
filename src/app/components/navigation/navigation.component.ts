import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { VideoPlayerService } from '@services/video-player.service';

@Component({
  selector: 've-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  mobileQuery: MediaQueryList;
  isPreviewReady = false;


  private _mobileQueryListener: () => void;


  constructor(
    private videoPlayerService: VideoPlayerService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  init() {
    this.videoPlayerService.playerSubjs.source.subscribe(player => {
      this.isPreviewReady = player ? true : false;
    });
  }
}

import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import * as locales from './../assets/locales.json';
import { LocalizeRouterService } from '@components/localize-router/localize-router.service';
import { Subscription } from 'rxjs';
import { MetaService } from '@services/meta.service';
import { MetaObj } from '@models/meta-obj.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  pageTitle: string;
  lang: string;
  languages: {id: string, title: string}[] = [];
  settings = locales['default'];

  subs: Subscription[] = [];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private translateService: TranslateService,
    private localize: LocalizeRouterService,
    private metaService: MetaService,
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 1023px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }


  ngOnChanges() {
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    for (const subs of this.subs) {
      subs.unsubscribe();
    }
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  init() {
    this.lang = this.translateService.currentLang;

    this.translateService.get(this.settings.locales.map(x => `LANGUAGES.${x.toUpperCase()}`))
      .subscribe(translations => {
        // init dropdown list with TRANSLATED list of languages from config
        this.languages = this.settings.locales.map(x => {
          return {
            id: x,
            title: translations[`LANGUAGES.${x.toUpperCase()}`],
          };
        });
      });
    this.subs.push(
      this.metaService.metaSubj.subscribe((obj: MetaObj) => {
        if (!obj) {
          this.pageTitle = '';
        } else {
          this.pageTitle = obj.pageTitle;
        }
      })
    );
  }

  ngAfterViewInit() {
  }

  changeLocale(lang) {
    this.lang = lang;
    this.localize.changeLanguage(lang);
  }

}

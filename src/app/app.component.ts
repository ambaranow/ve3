import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import * as locales from './../assets/locales.json';
import { LocalizeRouterService } from '@components/localize-router/localize-router.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {

  lang: string;
  languages: {id: string, title: string}[] = [];
  settings = locales['default'];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private translateService: TranslateService,
    private localize: LocalizeRouterService
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
    // initialize translate service
    // this.translateService.use(Settings.defaultLocale);
    // this.selectedLanguage = Settings.defaultLocale;

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
  }

  changeLocale(lang) {
    this.lang = lang;
    this.localize.changeLanguage(lang);
  }

}

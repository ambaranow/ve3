import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from 'src/app/settings';

@Component({
  selector: 've-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  selectedLanguage: string;
  languages: {id: string, title: string}[] = [];

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;


  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private translateService: TranslateService
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
    this.translateService.use(Settings.defaultLocale);
    this.selectedLanguage = Settings.defaultLocale;

    this.translateService.get(Settings.locales.map(x => `LANGUAGES.${x.toUpperCase()}`))
      .subscribe(translations => {
        // init dropdown list with TRANSLATED list of languages from config
        this.languages = Settings.locales.map(x => {
          return {
            id: x,
            title: translations[`LANGUAGES.${x.toUpperCase()}`],
          };
        });
      });
  }

  changeLocale(lang) {
    this.selectedLanguage = lang;
    this.translateService.use(this.selectedLanguage);
  }
}

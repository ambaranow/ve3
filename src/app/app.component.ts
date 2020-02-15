import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, OnDestroy, AfterViewInit, OnChanges } from '@angular/core';
import {MediaMatcher} from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';
import * as locales from './../assets/locales.json';
import { LocalizeRouterService } from '@components/localize-router/localize-router.service';
import { Subscription } from 'rxjs';
import { MetaService } from '@services/meta.service';
import { MetaObj } from '@models/meta-obj.js';
import { ViewService } from '@services/view.service.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GdprComponent } from '@components/gdpr/gdpr.component.js';
import { DomSanitizer } from '@angular/platform-browser';

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
  disabled = false;

  subs: Subscription[] = [];
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private localize: LocalizeRouterService,
    private metaService: MetaService,
    private viewService: ViewService,
    private _snackBar: MatSnackBar,
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 1023px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }


  ngOnChanges() {
  }

  ngOnInit() {
    this.init();
    this.subs.push(
      this.viewService.loaderSubj.subscribe(r => {
        this.disabled = r;
      })
    );
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
    this.openSnackBar();
  }

  ngAfterViewInit() {
  }

  changeLocale(lang) {
    this.lang = lang;
    this.localize.changeLanguage(lang);
  }

  closeSnackBar() {
    localStorage.setItem('gdprAgree','true');
    this._snackBar.dismiss();
  }

  openSnackBar() {
    const isAgree = localStorage.getItem('gdprAgree');
    if (!isAgree) {
      this.translateService.get('GDPR.BAR').subscribe(message => {
        this._snackBar.openFromComponent(GdprComponent, {
          duration: 30 * 24 * 60 * 60 * 1000,
          data: {
            message: this.sanitizer.bypassSecurityTrustHtml(message),
            close: () => {
              this.closeSnackBar();
            }
          }
        });
      });
    }
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ads-privacy-page',
  templateUrl: './privacy-page.component.html',
  styleUrls: ['./privacy-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrivacyPageComponent implements OnInit {

  icon = '';
  title = '';
  text: SafeHtml;

  constructor(
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translateService.stream(['GDPR.TITLE','GDPR.TEXT']).subscribe(gdpr => {
      this.title = gdpr['GDPR.TITLE'];
      this.text = this.sanitizer.bypassSecurityTrustHtml(gdpr['GDPR.TEXT']);
    });
  }

}

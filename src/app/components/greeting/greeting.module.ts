import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GreetingComponent } from './greeting.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { HttpClient } from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { LocalizeRouterModule } from '@components/localize-router/localize-router.module';
import { RouterModule } from '@angular/router';
import { AdsenseModule } from 'ng2-adsense';



@NgModule({
  declarations: [
    GreetingComponent,
  ],
  exports: [
    GreetingComponent,
  ],
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    LocalizeRouterModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    AdsenseModule.forRoot({
      adClient: 'ca-pub-7377476947438260',
      adSlot: 9205888442,
      adFormat: 'auto',
      display: 'block'
    }),
  ]
})
export class GreetingModule { }

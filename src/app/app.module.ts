import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderComponent } from './components/loader/loader.component';
import { VideoModule } from '@components/video/video.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { AppRoutingModule } from './app-routing.module';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { GreetingModule } from '@components/greeting/greeting.module';
import { AudioModule } from '@components/audio/audio.module';
import { AdsenseModule } from 'ng2-adsense';
import { GdprComponent } from './components/gdpr/gdpr.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PrivacyPageComponent } from './components/gdpr/privacy-page/privacy-page.component';
import { ArticleComponent } from './components/article/article.component';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    GdprComponent,
    PrivacyPageComponent,
    ArticleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    VideoModule,
    AudioModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatBadgeModule,
    MatSnackBarModule,
    AppRoutingModule,
    GreetingModule,
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

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
  ],
  exports: [
    TranslateModule,
    MatSnackBarModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

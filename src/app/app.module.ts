import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderComponent } from './components/loader/loader.component';
import {
  MatProgressSpinnerModule,
  MatIconModule,
  MatSidenavModule,
  MatToolbarModule,
  MatListModule,
  MatButtonModule } from '@angular/material';
import { VideoModule } from '@components/video/video.module';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';

import { EmptyComponent } from '@components/empty/empty.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MissingTranslationService } from '@services/missing-translation.service';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    AppComponent,
    EmptyComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    VideoModule,
    AppRoutingModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationService },
      useDefaultLang: false,
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

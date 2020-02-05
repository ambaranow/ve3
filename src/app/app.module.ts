import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderComponent } from './components/loader/loader.component';
import { MatProgressSpinnerModule } from '@angular/material';
import { NavigationModule } from '@components/navigation/navigation.module';
import { VideoModule } from '@components/video/video.module';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';

import { EmptyComponent } from '@components/empty/empty.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MissingTranslationService } from '@services/missing-translation.service';
import { HttpLoaderFactory } from '@services/http-loader.factory';



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
    NavigationModule,
    AppRoutingModule,
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

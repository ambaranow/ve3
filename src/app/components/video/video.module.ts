import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video.component';
import { FileUploadModule } from '@components/file-upload/file-upload.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoTrimmerComponent } from './video-trimmer/video-trimmer.component';
import { KeyframesLineComponent } from './keyframes-line/keyframes-line.component';
import { MatProgressBarModule,
  MatSliderModule,
  MatCheckboxModule,
  MatTabsModule,
  MatGridListModule,
  MatButtonModule } from '@angular/material';
import { VideoReverseComponent } from './video-reverse/video-reverse.component';
import { DownloadLinkComponent } from '@components/download-link/download-link.component';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { HttpClient } from '@angular/common/http';
import { MissingTranslationService } from '@services/missing-translation.service';



@NgModule({
  declarations: [
    VideoComponent,
    VideoPreviewComponent,
    VideoTrimmerComponent,
    KeyframesLineComponent,
    VideoReverseComponent,
    DownloadLinkComponent,
  ],
  imports: [
    CommonModule,
    FileUploadModule,
    FormsModule,
    MatProgressBarModule,
    MatSliderModule,
    MatTabsModule,
    MatCheckboxModule,
    MatGridListModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      // missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationService },
      // useDefaultLang: false,
    })


  ],
  exports: [VideoComponent]
})
export class VideoModule { }

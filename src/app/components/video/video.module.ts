import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video.component';
import { FileUploadModule } from '@components/file-upload/file-upload.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoCutterComponent } from './video-cutter/video-cutter.component';
import { KeyframesLineComponent } from './keyframes-line/keyframes-line.component';
import { MatProgressBarModule,
  MatSliderModule,
  MatCheckboxModule,
  MatTabsModule,
  MatGridListModule,
  MatButtonModule } from '@angular/material';
import { VideoReverseComponent } from './video-reverse/video-reverse.component';
import { DownloadLinkComponent } from '@components/download-link/download-link.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { HttpClient } from '@angular/common/http';
import { VideoControlsComponent } from './video-controls/video-controls.component';



@NgModule({
  declarations: [
    VideoComponent,
    VideoPreviewComponent,
    VideoCutterComponent,
    KeyframesLineComponent,
    VideoReverseComponent,
    DownloadLinkComponent,
    VideoControlsComponent,
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
    })


  ],
  exports: [VideoComponent]
})
export class VideoModule { }

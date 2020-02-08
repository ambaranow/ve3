import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video.component';
import { FileUploadModule } from '@components/file-upload/file-upload.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoCutterComponent } from './video-cutter/video-cutter.component';
import { KeyframesLineComponent } from './keyframes-line/keyframes-line.component';
import { VideoReverseComponent } from './video-reverse/video-reverse.component';
import { DownloadLinkComponent } from '@components/download-link/download-link.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { HttpClient } from '@angular/common/http';
import { VideoControlsComponent } from './video-controls/video-controls.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSliderModule} from '@angular/material/slider';
import { ExtractMp3Component } from './extract-mp3/extract-mp3.component';
import { GreetingModule } from '@components/greeting/greeting.module';
import { RemoveAudioComponent } from './remove-audio/remove-audio.component';


@NgModule({
  declarations: [
    VideoComponent,
    VideoPreviewComponent,
    VideoCutterComponent,
    KeyframesLineComponent,
    VideoReverseComponent,
    DownloadLinkComponent,
    VideoControlsComponent,
    ExtractMp3Component,
    RemoveAudioComponent,
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
    GreetingModule,
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

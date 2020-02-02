import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './video.component';
import { FileUploadModule } from '@components/file-upload/file-upload.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VideoPreviewComponent } from './video-preview/video-preview.component';
import { VideoTrimmerComponent } from './video-trimmer/video-trimmer.component';
import { KeyframesLineComponent } from './keyframes-line/keyframes-line.component';
import { MatProgressBarModule, MatSliderModule, MatCheckboxModule } from '@angular/material';



@NgModule({
  declarations: [
    VideoComponent,
    VideoPreviewComponent,
    VideoTrimmerComponent,
    KeyframesLineComponent
  ],
  imports: [
    CommonModule,
    FileUploadModule,
    FormsModule,
    MatProgressBarModule,
    MatSliderModule,
    MatCheckboxModule,
    ReactiveFormsModule,

  ],
  exports: [VideoComponent]
})
export class VideoModule { }

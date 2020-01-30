import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoTrimmerComponent } from './video-trimmer.component';
import { KeyframesLineModule } from '../keyframes-line/keyframes-line.module';
import { MatSliderModule, MatButtonModule, MatProgressBarModule } from '@angular/material';
import { FormsModule } from '@angular/forms';




@NgModule({
  declarations: [VideoTrimmerComponent],
  imports: [
    CommonModule,
    FormsModule,
    KeyframesLineModule,
    MatSliderModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  exports: [
    VideoTrimmerComponent,
  ]
})
export class VideoTrimmerModule { }

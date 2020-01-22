import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FfmpegComponent } from './ffmpeg.component';



@NgModule({
  declarations: [FfmpegComponent],
  imports: [
    CommonModule
  ],
  exports: [
    FfmpegComponent,
  ]
})
export class FfmpegModule { }

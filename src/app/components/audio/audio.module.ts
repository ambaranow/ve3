import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioControlsComponent } from './audio-controls/audio-controls.component';
import { AudioPreviewComponent } from './audio-preview/audio-preview.component';



@NgModule({
  declarations: [AudioControlsComponent, AudioPreviewComponent],
  imports: [
    CommonModule
  ]
})
export class AudioModule { }

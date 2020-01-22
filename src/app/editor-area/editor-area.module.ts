import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorAreaComponent } from './editor-area.component';
import { MatButtonModule, MatProgressBarModule, MatIconModule, MatCardModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from './../file-upload/file-upload.module';
import { VideoTrimmerModule } from '../video-trimmer/video-trimmer.module';

@NgModule({
  declarations: [EditorAreaComponent],
  exports: [EditorAreaComponent],
  imports: [
    CommonModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatProgressBarModule,
    VideoTrimmerModule
  ]
})
export class EditorAreaModule { }

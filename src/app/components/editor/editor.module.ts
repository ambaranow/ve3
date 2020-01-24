import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { EditorComponent } from './editor.component';
import { MatButtonModule, MatProgressBarModule, MatIconModule, MatCardModule,
  MatSidenavModule, MatToolbarModule, MatListModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { VideoTrimmerModule } from '../video-trimmer/video-trimmer.module';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';
import { NavigationComponent } from '@components/navigation/navigation.component';
import { EmptyComponent } from '@components/empty/empty.component';


@NgModule({
  declarations: [
    EditorComponent,
    NavigationComponent,
    VideoPreviewComponent,
    EmptyComponent,
  ],
  exports: [EditorComponent],
  imports: [
    CommonModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterModule,
    VideoTrimmerModule
  ]
})
export class EditorModule { }

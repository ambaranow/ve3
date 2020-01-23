import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorAreaComponent } from './editor-area.component';
import { MatButtonModule, MatProgressBarModule, MatIconModule, MatCardModule } from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { VideoTrimmerModule } from '../video-trimmer/video-trimmer.module';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';
// import { Routes } from '@angular/router';

// const editorAreaRoutes: Routes = [
//   {
//     path: 'video',
//     component: VideoPreviewComponent,
//     // children: [
//     //   {
//     //     path: '',
//     //     component: VideoPreviewComponent,
//     //     children: [
//     //       // {
//     //       //   path: ':id',
//     //       //   component: CrisisDetailComponent
//     //       // },
//     //       // {
//     //       //   path: '',
//     //       //   component: CrisisCenterHomeComponent
//     //       // }
//     //     ]
//     //   }
//     // ]
//   }
// ];

@NgModule({
  declarations: [EditorAreaComponent, VideoPreviewComponent],
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

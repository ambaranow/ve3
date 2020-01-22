import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './file-upload.component';
import { NgxFileHelpersModule } from 'ngx-file-helpers';



@NgModule({
  declarations: [FileUploadComponent],
  imports: [
    CommonModule,
    NgxFileHelpersModule
  ],
  exports: [
    FileUploadComponent,
  ]
})
export class FileUploadModule { }

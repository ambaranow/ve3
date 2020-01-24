import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';
import { VideoTrimmerComponent } from '@components/video-trimmer/video-trimmer.component';


const editorRoutes: Routes = [
  { path: 'video', component: VideoTrimmerComponent, outlet: 'actions' },
];

@NgModule({
  imports: [RouterModule.forChild(editorRoutes)],
  exports: [RouterModule]
})
export class EditorRoutingModule { }

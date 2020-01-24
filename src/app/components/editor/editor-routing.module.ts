import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoTrimmerComponent } from '@components/video-trimmer/video-trimmer.component';
import { EmptyComponent } from '@components/empty/empty.component';


const editorRoutes: Routes = [
  // { path: 'video', component: EmptyComponent, outlet: 'actions'},
  { path: 'trim', component: VideoTrimmerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(editorRoutes)],
  exports: [RouterModule]
})
export class EditorRoutingModule { }

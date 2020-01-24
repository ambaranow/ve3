import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditorComponent } from '@components/editor/editor.component';
import { EditorRoutingModule } from '@components/editor/editor-routing.module';
import { VideoPreviewComponent } from '@components/video-preview/video-preview.component';


const routes: Routes = [
  { path: '', component: EditorComponent,
    children: [
      // { path: 'video', component: VideoPreviewComponent, outlet: 'actions' }
      // { path: 'video', component: VideoPreviewComponent }
  ]},
  // { path: '', redirectTo: '/main', pathMatch: 'full' }
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { enableTracing: true }),
    EditorRoutingModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

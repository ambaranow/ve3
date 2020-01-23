import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditorAreaComponent } from '@components/editor-area/editor-area.component';


const routes: Routes = [
  { path: '', component: EditorAreaComponent},
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

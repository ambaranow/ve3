import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UrlTree, DefaultUrlSerializer, UrlSerializer } from '@angular/router';
import { EmptyComponent } from '@components/empty/empty.component';
import { VideoComponent } from '@components/video/video.component';

export class CleanUrlSerializer extends DefaultUrlSerializer {
  public parse(url: string): UrlTree {
    // console.log('>>> parse')
    function cleanUrl(url: string) {
      // console.log('>>> cleanUrl')
      // console.log(url)
      console.log(url.replace(/\(|\)/g, ''))
      return url.replace(/\(|\)/g, ''); // for example to delete parenthesis
    }
    return super.parse(cleanUrl(url));
  }
}

const routes: Routes = [
  { path: '', component: EmptyComponent,
    children: [
  ]},
  { path: 'video', component: VideoComponent },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      // { enableTracing: true }
      ),
  ],
  providers: [
    // {
    //     provide: UrlSerializer,
    //     useClass: CleanUrlSerializer,
    // }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

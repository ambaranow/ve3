import { NgModule } from '@angular/core';
import { Location } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { EmptyComponent } from '@components/empty/empty.component';
import { VideoComponent } from '@components/video/video.component';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterSettings } from '@components/localize-router/localize-router.config';
import { LocalizeRouterModule } from '@components/localize-router/localize-router.module';
import { LocalizeParser } from '@components/localize-router/localize-router.parser';
import { LocalizeRouterHttpLoader } from '@components/localize-router/http-loader';

export function HttpLoaderFactory(translate: TranslateService, location: Location, settings: LocalizeRouterSettings, http: HttpClient) {
  return new LocalizeRouterHttpLoader(translate, location, settings, http);
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
    LocalizeRouterModule.forRoot(routes, {
      parser: {
        provide: LocalizeParser,
        useFactory: HttpLoaderFactory,
        deps: [TranslateService, Location, LocalizeRouterSettings, HttpClient]
      }
    })
  ],
  providers: [
    // {
    //     provide: UrlSerializer,
    //     useClass: CleanUrlSerializer,
    // }
  ],
  exports: [RouterModule, LocalizeRouterModule]
})
export class AppRoutingModule { }

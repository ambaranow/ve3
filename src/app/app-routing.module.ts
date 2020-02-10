import { NgModule } from '@angular/core';
import { Location } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { VideoComponent } from '@components/video/video.component';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterSettings } from '@components/localize-router/localize-router.config';
import { LocalizeRouterModule } from '@components/localize-router/localize-router.module';
import { LocalizeParser } from '@components/localize-router/localize-router.parser';
import { LocalizeRouterHttpLoader } from '@components/localize-router/http-loader';
import { VideoCutterComponent } from '@components/video/video-cutter/video-cutter.component';
import { ExtractAudioComponent } from '@components/video/extract-audio/extract-audio.component';
import { VideoReverseComponent } from '@components/video/video-reverse/video-reverse.component';
import { RemoveAudioComponent } from '@components/video/remove-audio/remove-audio.component';

export function HttpLoaderFactory(translate: TranslateService, location: Location, settings: LocalizeRouterSettings, http: HttpClient) {
  return new LocalizeRouterHttpLoader(translate, location, settings, http);
}
const routes: Routes = [
  { path: '', redirectTo: '/video/cut', pathMatch: 'full'},
  { path: 'video', component: VideoComponent, children: [
    {path: 'cut', component: VideoCutterComponent },
    {path: 'extract-audio', component: ExtractAudioComponent },
    {path: 'reverse', component: VideoReverseComponent },
    {path: 'remove-audio', component: RemoveAudioComponent }
    ]
  },
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

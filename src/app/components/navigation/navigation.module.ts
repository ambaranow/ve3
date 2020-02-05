import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { MatIconModule, MatSidenavModule, MatToolbarModule, MatListModule, MatButtonModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';
import { HttpLoaderFactory } from '@services/http-loader.factory';
import { HttpClient } from '@angular/common/http';
import { MissingTranslationService } from '@services/missing-translation.service';



@NgModule({
  declarations: [NavigationComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingTranslationService },
      useDefaultLang: false,
    })
  ],
  exports: [NavigationComponent],
})
export class NavigationModule { }

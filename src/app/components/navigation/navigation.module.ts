import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { MatIconModule, MatSidenavModule, MatToolbarModule, MatListModule, MatButtonModule } from '@angular/material';
import { RouterModule } from '@angular/router';



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
  ],
  exports: [NavigationComponent],
})
export class NavigationModule { }

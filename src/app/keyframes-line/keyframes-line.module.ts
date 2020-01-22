import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyframesLineComponent } from './keyframes-line.component';



@NgModule({
  declarations: [KeyframesLineComponent],
  imports: [
    CommonModule
  ],
  exports: [
    KeyframesLineComponent,
  ]
})
export class KeyframesLineModule { }

import { Injectable, ElementRef } from '@angular/core';
import { async } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  player: ElementRef;
  attempts = 0;
  constructor() { }

  getPlayer() {
    // if (this.player) {
      return this.player;
    // } else if (this.attempts < 20) {
    //   this.attempts++;
    //   setTimeout(this.getPlayer, 500);
    // }
  }


  setPlayer(el) {
    this.player = el; // DIV, video element wrapper
  }
}

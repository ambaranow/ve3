import { Injectable, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  player: ElementRef;
  attempts = 0;
  constructor() { }

  getPlayer() {
    const getEl = () => {
      console.log('getEl ' + this.attempts)
      if (!this.player && this.attempts < 20) {
        this.attempts++;
        setTimeout(() => {
          getEl();
        }, 500);
      } else {
        console.log('>>>> this.player')
        return this.player;
      }
    };
    this.attempts = 0;
    getEl();
  }


  setPlayer(el) {
    this.player = el; // DIV, video element wrapper
  }
}

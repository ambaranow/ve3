import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  volumeSubj = new BehaviorSubject<number>(0.25);

  player = {
    source: {
      el: undefined,
      playerSubj: new BehaviorSubject<any>(undefined),
      playedSubj: new BehaviorSubject<boolean>(false),
      currentTimeSubj: new BehaviorSubject<number>(0),
    },
    target: {
      el: undefined,
      playerSubj: new BehaviorSubject<any>(undefined),
      playedSubj: new BehaviorSubject<boolean>(false),
      currentTimeSubj: new BehaviorSubject<number>(0),
    }
  };
  constructor() { }

  getPlayer(id: string) {
    return this.player[id].el;
  }

  setPlayer(el,  id: string) {
    this.player[id].el = el; // DIV, video element wrapper
    this.player[id].playerSubj.next(this.player[id].el);
    // console.log(this.players[id])
  }

  play(id) {
    if (this.player[id].el) {
      // this.players[id].play();
      const playPromise = this.player[id].el.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.player[id].playedSubj.next(true);
        })
        .catch(error => {
        });
      }
    }
  }

  pause(id) {
    if (this.player[id].el) {
      this.player[id].el.pause();
      this.player[id].playedSubj.next(false);
    }
  }

  setVolume(val) {
    this.volumeSubj.next(val);
  }

}

import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  players = {
    source: undefined,
    target: undefined
  };
  playerSubjs = {
    source: new BehaviorSubject<any>(undefined),
    target: new BehaviorSubject<any>(undefined)
  };
  currentTimeSubjs = {
    source: new BehaviorSubject<number>(0),
    target: new BehaviorSubject<number>(0)
  };
  stateSubjs = {
    source: new BehaviorSubject<string>('paused'),
    target: new BehaviorSubject<string>('paused')
  };

  constructor() { }

  getPlayer(id: string) {
    return this.players[id];
  }

  setPlayer(el,  id: string) {
    this.players[id] = el; // DIV, video element wrapper
    this.playerSubjs[id].next(this.players[id]);
    // console.log(this.players[id])
  }

  play(id) {
    if (this.players[id]) {
      // this.players[id].play();
      const playPromise = this.players[id].play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.stateSubjs[id].next('played');
        })
        .catch(error => {
        });
      }
    }
  }

  pause(id) {
    if (this.players[id]) {
      this.players[id].pause();
      this.stateSubjs[id].next('paused');
    }
  }

}

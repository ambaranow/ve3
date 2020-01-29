import { Injectable, ElementRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {

  player = undefined;
  playerSubj: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);
  currentTimeSubj: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  attempts = 0;
  constructor() { }

  getPlayer() {
    return this.player;
  }

  setPlayer(el) {
    this.player = el; // DIV, video element wrapper
    this.playerSubj.next(this.player);
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewService {

  loader = false;
  loaderSubj: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor() { }



  loaderOn() {
    if (!this.loader) {
      this.loader = true;
      this.loaderSubj.next(true);
    }
  }

  loaderOff() {
    this.loader = false;
    this.loaderSubj.next(false);
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MetaObj } from '@models/meta-obj';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  metaSubj: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

  constructor() { }

  setMeta(obj: MetaObj) {
    console.log('this.setMeta')
    console.log(obj)
    this.metaSubj.next(obj)
  }
}

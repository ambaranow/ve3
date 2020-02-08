import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ads-keyframes-line',
  templateUrl: './keyframes-line.component.html',
  styleUrls: ['./keyframes-line.component.scss']
})
export class KeyframesLineComponent implements OnInit {

  constructor() { }

  @Input()
  keyFrames: [];

  ngOnInit() {
  }

}

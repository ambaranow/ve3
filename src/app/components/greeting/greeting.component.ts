import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ads-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss']
})
export class GreetingComponent implements OnInit {

  cards = [
    'CUT',
    'REVERSE',
    'EXTRACTAUDIO',
    'MUTE',
    'SECURE',
    'INTERFACE',
    'SPEED',
    'FORMATS',
    'FUNCTIONS',
    'HOWIT',
    'FREE'
  ]
  constructor() { }

  @Input()
  hideButtons = false;

  ngOnInit() {
  }

}

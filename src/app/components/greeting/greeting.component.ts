import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ads-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss']
})
export class GreetingComponent implements OnInit {

  constructor() { }

  @Input()
  hideButtons = false;

  ngOnInit() {
  }

}

import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ads-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ArticleComponent implements OnInit {

  constructor() { }

  @Input()
  title: SafeHtml;
  @Input()
  text: SafeHtml;


  ngOnInit(): void {
  }

}

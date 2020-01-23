import { Component, OnInit } from '@angular/core';
import { ViewService } from '@services/view.service';

@Component({
  selector: 've-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  loader;
  loaderSubs;

  constructor(
    private viewService: ViewService
  ) { }

  ngOnInit() {
    this.loaderSubs = this.viewService.loaderSubj.subscribe(r => {
      this.loader = r;
    });
  }

}

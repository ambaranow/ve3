import { Component, OnInit, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-download-link',
  templateUrl: './download-link.component.html',
  styleUrls: ['./download-link.component.scss']
})
export class DownloadLinkComponent implements OnInit {

  @Input()
  link: SafeUrl;

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppConfigService } from '../../../app-config.service';
declare function PreloadEmbedMenu(a, b, c): any;
@Component({
  selector: 'app-firesideuntapped',
  templateUrl: './firesideuntapped.component.html',
  styleUrls: ['./firesideuntapped.component.scss']
})
export class FiresideuntappedComponent implements OnInit {
  fireside = '';

  constructor(private authenticationService: AppConfigService) {
    this.fireside = this.authenticationService.fireside;
  }

  ngOnInit() {
    PreloadEmbedMenu('menu-container', 23447, 89585);
  }

}

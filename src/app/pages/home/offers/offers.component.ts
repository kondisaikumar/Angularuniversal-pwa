import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../../app-config.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  offer = '';
  fireside = '';
  jobs = '';
  constructor(private authenticationService: AppConfigService) {
    this.offer = this.authenticationService.offer;
    this.fireside = this.authenticationService.fireside;
    this.jobs = this.authenticationService.liquorWorldJobs;
  }
  ngOnInit() {
  }
}

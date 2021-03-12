import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../../app-config.service';
import { Router, NavigationEnd } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {
  jobs = '';

  constructor(private authenticationService: AppConfigService, private router: Router) {
    this.jobs = this.authenticationService.liquorWorldJobs;
  }

  ngOnInit() {
  }
}

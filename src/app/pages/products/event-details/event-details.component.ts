import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { EventGetDetails } from '../../../state/product-store/product-store.action';
import { EventGetDetailsRequestPayload } from '../../../models/event-get-details-request-payload';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
//  
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionService } from 'src/app/shared/services/session.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {

  eventDetails: any;
  currentStoreId: number;

  constructor(private route: ActivatedRoute,
    private store: Store<EventGetDetailsRequestPayload>,
    private productStoreService: ProductStoreService,
    private commonService:CommonService,
    private appConfig: AppConfigService,
    private sessionService:SessionService,
    //  
    private progressBarService: ProgressBarService) {

    this.store.select(ProductStoreSelectors.eventGetDetailsData)
      .subscribe(egdd => {
        this.eventDetails = egdd;
        
        this.progressBarService.hide();
      });
  }

  ngOnInit() {
    const storeid = this.route.snapshot.paramMap.get('storeid');
    if (storeid !== localStorage.getItem('storeId')) {
      localStorage.setItem('storeId', storeid);
      // this.onStoreChange(storeid);
      this.commonService.currentStoreid.next(storeid);
    }else{
    this.getEventDetails();
    }
  }

  getEventDetails() {
    
    this.progressBarService.show();
    const eventId = +this.route.snapshot.paramMap.get('id');
    if ( eventId ) {
      this.store.dispatch(new EventGetDetails(this.productStoreService.getEventGetDetailsParams(eventId)));
    }
  }
  onStoreSelectConfirm(storeId: number) {
    this.currentStoreId = storeId;
    localStorage.setItem('storeId', this.currentStoreId.toString());
    this.appConfig.storeID = this.currentStoreId;
    this.sessionService.createNewSession();
    this.commonService.onCacheUpdated();
  }
}

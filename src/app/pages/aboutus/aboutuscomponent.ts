import { Component, OnInit } from '@angular/core';
import { ProductStoreService } from '../../services/product-store.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.scss']
})
export class AboutusComponent implements OnInit {

  storeDetails: any;
  constructor(private storeService: ProductStoreService,private commonService:CommonService) {}

  ngOnInit() {
    this.getStoreDetails();
    this.commonService.updateMeta('About Us')
  }

  getStoreDetails() {
    this.storeService.getStoreDetails().subscribe(data => {
      if (data && data.GetStoredetails) {
        this.storeDetails = data.GetStoredetails;
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../../app-config.service';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';
import { CustomerLoginSession } from 'src/app/models/customer-login-session';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-downloadapp',
  templateUrl: './downloadapp.component.html',
  styleUrls: ['./downloadapp.component.scss']
})
export class DownloadappComponent implements OnInit {
  downloadapp = '';
  storeGetHomeData: any;
  downloadLink: any;
  constructor(private authenticationService: AppConfigService,private store: Store<CustomerLoginSession>,private storeService: ProductStoreService,) {
    this.downloadapp = this.authenticationService.downloadapp;
    this.store.select(ProductStoreSelectors.productStoreStateData)
    .subscribe(pssd => {
      this.storeGetHomeData = pssd;
      // console.log(this.storeGetHomeData);
      // this.downloadLink = "https://api.qrserver.com/v1/create-qr-code/?data="+this.storeGetHomeData.DownloadLink+"&amp;size=100x100";
    });
  }

  ngOnInit() {
  }

}

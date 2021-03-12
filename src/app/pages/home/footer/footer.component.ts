import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { ProductStoreService } from '../../../services/product-store.service';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { CustomerSelectors } from '../../../state/customer/customer.selector';
import { AppConfigService } from '../../../app-config.service';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  /* storeGetHomeData: any;
  constructor(private store: Store<any>) {
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        this.storeGetHomeData = pssd;
      });
  } */
  @ViewChild('openMultiLocationModal') openModal: ElementRef;
  partners = '';
  storeDetails: any;
  isAccordionStoreActive: boolean;
  isAccordionLinksActive: boolean;
  storeList: any;
  storeGetHomeData: any;
  couponAvailable: any;
  constructor(private store: Store<CustomerLoginSession>,
    private storeService: ProductStoreService, private authenticationService: AppConfigService,
    private router: Router, private commonService: CommonService) {
      this.commonService.storeList.subscribe((res: any) => {
this.storeList = res;
      });
    this.partners = this.authenticationService.partners;

    this.store.select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        if (clsd) {
          this.getStoreDetails();
        }
      });
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        this.storeGetHomeData = pssd;
        if (pssd && pssd.IsCouponAvailable) {
          this.couponAvailable = pssd.IsCouponAvailable;
        }
      });

  }
  openMultiLocationDialog() {
    this.openModal.nativeElement.click();
  }
  ngOnInit() {

  }
  toggleFooterAccordion(selecteditem){
    if(selecteditem == "store"){
    this.isAccordionStoreActive =!this.isAccordionStoreActive;
    this.isAccordionLinksActive=false
    }     
    if(selecteditem =="links"){
      this.isAccordionLinksActive =!this.isAccordionLinksActive
      this.isAccordionStoreActive=false
      }   

  }
  getClasses(){
    if(this.router.url.includes('product-details')){
      return 'design-bottom'
    }
  }
  date= new Date()
  getStoreDetails() {
    this.storeService.getStoreDetails().subscribe(data => {
      if (data && data.GetStoredetails) {
        this.storeDetails = data.GetStoredetails;
      }
    });
  }
}

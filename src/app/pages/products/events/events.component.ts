import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { BannerService } from 'src/app/services/banner.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  storeGetHomeData: any;
  constructor(private store: Store<CustomerLoginSession>,   @Inject(PLATFORM_ID) private platformId: object, private banerService: BannerService, private router: Router, private dataservice: DataService,private commonService:CommonService) {
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          if(this.storeGetHomeData.PromotionList && !this.commonService.bannerclicks){
            this.commonService.bannerclicks = true;
         for(let i = 0; i < this.storeGetHomeData.PromotionList.length; i++){
          this.banerService.bannerAndPromotionClicks(this.storeGetHomeData.PromotionList[i].PromotionId,'E','V').subscribe((res)=>{
          });
         }
           }
          
        }
        this.commonService.updateMeta('Events')
      });
   }

  ngOnInit() {
  }

  onEventClick(res: any) {
    this.banerService.bannerAndPromotionClicks(res.PromotionId,'E','C').subscribe((res)=>{
    })
    if (res.PromotionTypeId === 1) {
      this.router.navigate([`/event-details/${res.Event.EventId}/${localStorage.getItem('storeId')}`]);
      (<any>window).ga('eventTracking.send', 'event','EventClicked',localStorage.getItem('storeId'),res.Title);
    }
  
    if (res.PromotionTypeId === 2) {
      if (res.TargetContent.startsWith('#')) {
        this.dataservice.categoryId = '1,2,3,4';
        const type=res.TargetContent.replace('#','hash-')
        this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: type } });
       (<any>window).ga('eventTracking.send', 'event','ProductListEventClicked',localStorage.getItem('storeId'),res.Title);
        
      } else {
      this.router.navigate([`/product-details/ ${res.TargetContent}/${localStorage.getItem('storeId')}`]);
      (<any>window).ga('eventTracking.send', 'event','ProductEventClicked',localStorage.getItem('storeId'),res.Title);
      localStorage.setItem('EventsProductId', res.TargetContent);
  
      }
    }
  
    if (res.PromotionTypeId === 3) {
      this.dataservice.categoryId = '1,2,3,4';
      this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: res.TargetContent } });
      (<any>window).ga('eventTracking.send', 'event','ProductListEventClicked',localStorage.getItem('storeId'),res.Title);
    }
  
    if (res.PromotionTypeId === 4) {
      this.router.navigate([`/recipe-details/${res.TargetContent}`]);
      (<any>window).ga('eventTracking.send', 'event','RecipeEventClicked',localStorage.getItem('storeId'),res.Title);
    }
    if (res.PromotionTypeId === 5) {
  window.open(res.TargetContent, '_blank');
  (<any>window).ga('eventTracking.send', 'event','URLEventClicked',localStorage.getItem('storeId'),res.Title);
  
  }
    }
}


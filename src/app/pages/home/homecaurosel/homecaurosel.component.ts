import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../app-config.service';
declare var jQuery: any;
import * as promotionalimages from '../../../shared/promotionImages.json';
import { BannerService } from 'src/app/services/banner.service';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from 'src/app/models/customer-login-session';
import { CustomerSelectors } from 'src/app/state/customer/customer.selector';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
  selector: 'app-homecaurosel',
  templateUrl: './homecaurosel.component.html',
  styleUrls: ['./homecaurosel.component.scss']
})
export class HomecauroselComponent implements OnInit {
  @Input() eventList: any;
  promotionImage = [];
defaultpromotionList=[{
  AppId: 0,
  BannerId: 0,
  BannerTargetContent: '',
  BannerTargetType: '',
  BannerTitle: 'Default',
  BannerURL: '../../../../assets/Images/default-carousel-img.jpg',
  SortNumber: 0,
  StoreId: 0,
  UserId: 0,
  ViewTime: 0
}];
  promotionList = [];

  isShowFilters = false;
  categoryFilters: any;
  multistoreclicked: any;
  constructor(private router: Router,
    private store: Store<CustomerLoginSession>,
     public dataservice: DataService,
     @Inject(PLATFORM_ID) private platformId: object,
      public appConfigService: AppConfigService, 
      private commonService:CommonService,
       private banerService: BannerService) {
       this.banerService.bannerDetails.subscribe(
            (data: any) => {
                    if (data !== null && data !== undefined) {
                      this.promotionList = [...this.defaultpromotionList,...data];
                    }else if (data === null || data === undefined){
                      this.promotionList=[];
                      this.promotionList = [...this.defaultpromotionList];
                    }
                  });
              
   } 
  ngOnInit() {
    this.promotionList=[];
          this.promotionList = [...this.defaultpromotionList,...this.banerService.bannerArray];

    jQuery('#myCarousel').carousel({
      interval: 5000,
      pause: false,
      cycle: true
    });
  }

  clickbanner(params: any) {
    if(params.BannerId !== 0) {
      this.banerService.bannerAndPromotionClicks(params.BannerId,'B','C').subscribe((res)=>{
      });
    }
    if (params.BannerTargetType === 'productsearch') {
      this.dataservice.categoryId = '1,2,3,4';
      this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: params.BannerTargetContent } });
      (<any>window).ga('eventTracking.send', 'event','ProductListBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
    } else if (params.BannerTargetType === 'weblink') {
      window.open(params.BannerTargetContent, '_blank');
      (<any>window).ga('eventTracking.send', 'event','weblinkBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
    } else if (params.BannerTargetType === 'product') {
      if (params.BannerTargetContent.startsWith('#')) {
        this.dataservice.categoryId = '1,2,3,4';
        const type = params.BannerTargetContent.replace('#','hash-');
        this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: type, ListId: params.ListId } });
      (<any>window).ga('eventTracking.send', 'event','ProductListBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
      } else {
        this.router.navigate([`/product-details/ ${params.BannerTargetContent}/${localStorage.getItem('storeId')}`]);
      localStorage.setItem('EventsProductId', params.BannerTargetContent);
      (<any>window).ga('eventTracking.send', 'event','ProductBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
      localStorage.setItem('PromotionTitle', params.BannerTitle);
      }
    }
  }

  showFilters(categoryId) {
    this.isShowFilters = true;
    this.categoryFilters = { 'CategoryId': categoryId };
  }

  showProducts(catId, catName) {
    this.dataservice.searchByText = '';
    this.dataservice.categoryId = catId;
    this.dataservice.getFiltersByCategory();
    this.router.navigate([`/${catName}`], { queryParams: { storeid: localStorage.getItem('storeId'), cat: this.dataservice.categoryId } });
  }

  onApplyFilter() {
    this.isShowFilters = false;
  }
}

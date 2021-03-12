import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { DataService } from '../../../services/data.service';
import * as menuOptions from '../../../shared/store-filters.json';
import { ProductStoreService } from '../../../services/product-store.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent implements OnInit {
  storeGetHomeData: any;
  activeURL: string;
  activeMenu: string;
  menuItems = [
    { name: 'Home', url: '/feature-products' }
  ];

  isClicked = false;
  filterMenuItems: any;
  receipeMenuItem: any;
  couponMenuItem: any;
  eventsMenuItem: any;
  eventsList: any;
  couponAvailable = false;
  menuOptions = [];
  staffpicksTitle='';

  constructor(private store: Store<any>, private router: Router, public dataservice: DataService, private commonService: CommonService,
     private productStoreService: ProductStoreService) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.productStoreService.couponAvailable.subscribe(data => {
this.couponAvailable = data;
    });
     this.commonService.staffPicksTitle.subscribe((data:any)=>{
      this.staffpicksTitle=data;
     })
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if(pssd !== null){
          this.menuOptions = pssd;
          this.updateMenuItems();
        }
        
        this.storeGetHomeData = pssd;
        if (pssd && pssd.IsCouponAvailable) {
          this.couponAvailable = pssd.IsCouponAvailable;
        }
        if (pssd && pssd.EventList) {
          this.eventsList = pssd.EventList;
        }
      });

     this.router.events.subscribe((val) => {
      if (this.router.url.startsWith('/beer')) {
        this.activeURL = '/beer';
      } else if (this.router.url.startsWith('/liquor')) {
        this.activeURL = '/liquor';
      } else if (this.router.url.startsWith('/wine')) {
        this.activeURL = '/wine';
      } else if (this.router.url.startsWith('/mixers-more')) {
        this.activeURL = '/mixers-more';
      } else if (this.router.url.startsWith('/tobacco')) {
        this.activeURL = '/tobacco';
      } else {
        this.activeURL = this.router.url;
      }
    });
  }

  ngOnInit() {
    this.updateMenuItems();
  }

  updateMenuItems() {

    if (this.menuOptions && this.menuOptions['StoreFilters']) {
      this.filterMenuItems = this.menuOptions['StoreFilters'];
    }

    if (this.menuOptions && this.menuOptions['IsRecipes'] !== undefined) {
      if (this.menuOptions['IsRecipes']) {
        this.receipeMenuItem = { name: 'Recipes', url: '/recipes' };
      }
    } else {
      this.receipeMenuItem = { name: 'Recipes', url: '/recipes' };
    }
    // if (this.menuOptions && this.menuOptions['IsCouponAvailable'] !== undefined) {
    //   if (this.menuOptions['IsCouponAvailable']) {
    //     this.couponMenuItem = { name: 'Coupons', url: '/coupons' };
    //   }
    // }

    this.eventsMenuItem = { name: 'Events', url: '/events' };
  }

  showProducts(catId, catName) {
    this.isClicked = true;
    this.dataservice.searchByText = '';
    this.dataservice.categoryId = catId;
    this.dataservice.getFiltersByCategory();
    if (catName === 'Mixers & More') {
      catName = 'mixers-more';
    }
    // tslint:disable-next-line:max-line-length
    this.router.navigate([`/${catName.toLowerCase()}`], { queryParams: {storeid: localStorage.getItem('storeId'), cat: this.dataservice.categoryId}});
  }

  onApplyFilter() {
    this.isClicked = true;
  }
  getMenuName(catName) {
    if (catName === 'Mixers & More') {
      catName = 'mixers-more';
    }
    return `/${catName.toLowerCase()}`;
  }

}


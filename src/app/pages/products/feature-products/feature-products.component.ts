import { Component, OnChanges, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { ProductGetListRequestPayload } from '../../../models/product-get-list-request-payload';
import { ProductGetList } from '../../../state/product-store/product-store.action';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
//  
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-feature-products',
  templateUrl: './feature-products.component.html',
  styleUrls: ['./feature-products.component.scss']
})
export class FeatureProductsComponent implements OnInit {
  customOptions: any = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }

  // @Input() storeGetHomeData: any;
  storeGetHomeData: any;
  productsList = [];
  isFeatureProductsPage = false;
  isPrevious = false;
  isNext = false;
  currentCategoryId = '1,2,3,4';
  totalCount = 0;
  currentPageNo = 1;
  pageSize = 12;
  readMore = false;
  oldProductsList = [];
  staffPicksProductList = [];
  isHome: boolean;
  topBeerListProduct = [];
  topLiquorListProduct: any;
  topWineListProduct: any;
  constructor(private store: Store<ProductGetListRequestPayload>,
    private productStoreService: ProductStoreService,
    //  
    private router: Router,
    private progressBarService: ProgressBarService,
    private cartService: CartService) {

    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          if (pssd && pssd.IsCouponAvailable) {
            this.productStoreService.couponAvailable.next(pssd.IsCouponAvailable);
            this.productStoreService.couponAvailablecheckout = pssd.IsCouponAvailable;
          }
          this.currentPageNo = 1;
          this.getProductsList();
          
          this.progressBarService.hide();
        }
      });

    this.store.select(ProductStoreSelectors.productGetListData)
      .subscribe(pgld => {
        if (pgld) {
            this.oldProductsList = [...this.oldProductsList, ...pgld.ListProduct];
            this.productsList = this.oldProductsList.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
            this.totalCount = pgld.TotalCount;
            
            this.progressBarService.hide();
            if (this.productsList.length > 8 && this.totalCount > (this.currentPageNo * this.pageSize)) {
              this.readMore = true;
            } else {
              this.readMore = false;
            }
        }
      });
  }

  ngOnInit() {
    if (this.router.url === '/') { this.isHome = true; }
    this.currentPageNo = 1;
    this.oldProductsList = [];
    this.productsList = [];
    if (this.router.url === '/feature-products') {
      this.isFeatureProductsPage = true;
      this.getFeatureProducts();
    } else {
      this.isFeatureProductsPage = false;
      this.getProductsList();
    }
   
  }

  getProductsList() {
    if (
      (this.router.url === '/' || this.router.url.startsWith('/home')) &&
      (!this.productStoreService.isFavoritesUpdated && !this.cartService.isItemRemovedFromCart)) {
      this.productsList = [];
      this.oldProductsList = [];
      const sort = this.storeGetHomeData ? this.storeGetHomeData.HomeList : [];
      this.productsList = sort.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
      this.getFeatureProducts();
    } else {
      this.oldProductsList = [];
      this.getFeatureProducts();
      this.productStoreService.isFavoritesUpdated = false;
    }
  }
  showMoreProducts() {
    this.currentPageNo += 1;
    this.getFeatureProducts();
  }
  getFeatureProducts() {
    this.progressBarService.show();
    this.store.dispatch(new ProductGetList(
      this.productStoreService.getProductGetListParams(
        { categoryId: this.currentCategoryId, pageSize: this.pageSize, isFeatured: 0, isStaffPicks: 0,ProductType:1, pageNumber: this.currentPageNo })));
  }


}

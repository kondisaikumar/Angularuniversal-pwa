import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as CryptoJS from 'crypto-js';
import { ProductGetList } from '../../../state/product-store/product-store.action';
import { ProductGetDetails } from '../../../state/product-store/product-store.action';
import { ProductGetDetailsRequestPayload } from '../../../models/product-get-details-request-payload';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
//  
import { CartService } from '../../../services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data.service';
import { ProductFilters } from '../../../models/product-filters';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { SessionService } from '../../../shared/services/session.service';
import { AppConfigService } from '../../../app-config.service';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { CustomerSelectors } from '../../../state/customer/customer.selector';
import { CustomerLogin } from '../../../state/customer/customer.action';
import { baseUrl } from '../../../services/url-provider';
import { Menu } from 'src/app/models/types';
import { CommonService } from 'src/app/shared/services/common.service';
import { Meta, Title } from '@angular/platform-browser';
import { metaReducers } from 'src/app/app.state';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  @ViewChild('openCartReviewModal') openModal: ElementRef;
  @Output() storeChange = new EventEmitter<number>();
  @ViewChild('reviews') MyProp: ElementRef;
  @ViewChild('writeAReview') WriteAR: ElementRef;
  incorrectstoreid = false;
  productDetails: any;
  userReviews: any;
  qty: number;
  allFilters: ProductFilters;
  productsList: any;
  pageNumber = 0;
  varietalId = '';
  typeId = '';
  reviewAdded = false;
  isEdit = false;
  review: any;
  quantity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
  rating = 0;
  moreReviews: any;
  customerSession: any;
  inCorrectStore = false;
  countshow = 4;
  totalcount = 0;
  reviewItems = [];


  constructor(private route: ActivatedRoute, private sessionService: SessionService,
    private router:Router,
    private _meta:Meta,
    private _title:Title,
    private store: Store<ProductGetDetailsRequestPayload>,
    private productStoreService: ProductStoreService, private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: object,
    private cartService: CartService,
    private toastr: ToastrService,
    public dataservice: DataService, private appConfig: AppConfigService,
    private progressBarService: ProgressBarService) {
    this.store.select(ProductStoreSelectors.productGetDetailsData)
      .subscribe(pgdd => {

        if (!pgdd) {
          return; 
        }
        this.productDetails = pgdd;
        this._title.setTitle(this.productDetails.Product.ProductName);
        this._meta.updateTag({ property: 'og:Title', content: this.productDetails.Product.ProductName });
        this._meta.updateTag({ name: 'description', content: this.productDetails.ProductDescription});
        this._meta.updateTag({ name: 'url', content:  window.location.href });
        this._meta.updateTag({ property: 'og:description', content:this.productDetails.ProductDescription });
        this._meta.updateTag({ property: 'og:url', content:  window.location.href });
        this._meta.updateTag({ property: 'og:type', content: 'website' });
        this._meta.updateTag({ property: 'twitter:title', content:this.productDetails.Product.ProductName  });
        this._meta.updateTag({ property: 'twitter:description', content:this.productDetails.ProductDescription });
        this._meta.updateTag({ property: 'twitter:card', content: 'summary_large_image'});
        this._meta.updateTag({ property: 'og:image', content:this.productDetails.Product.ProductImg});
        this._meta.updateTag({ name: 'twitter:image', content: this.productDetails.Product.ProductImg });
        this._meta.updateTag({ itemprop:"name", content:this.productDetails.Product.ProductName});
        this._meta.updateTag({ itemprop:"description", content:this.productDetails.ProductDescription});
        this._meta.updateTag({ itemprop: 'image', content: this.productDetails.Product.ProductImg });

        this.totalcount = this.productDetails.ReviewTotalCount;
  
        if (pgdd) {
          // this.userReviews = [...pgdd.ListReview];

          // if (pgdd && pgdd.UserReview && pgdd.UserReview.ReviewId !== 0) {
          //   this.userReviews = [...this.userReviews, ...pgdd.UserReview];
          // }
          this.getalluserReviews();

          /* if (pgdd.ReviewTotalCount > 2) {
            this.getMoreReviews();
          } */
        }

        if (this.productDetails.Product && this.productDetails.Product.InCart > 0) {
          this.qty = this.productDetails.Product.InCart;
        }
        if (this.productDetails.RatingAverage) {
          this.rating = +this.productDetails.RatingAverage;
        }
        this.getRelatedProducts();
        
        this.progressBarService.hide();
      });

    this.store.select(ProductStoreSelectors.productGetListData)
      .subscribe(pgld => {
        if (pgld) {
          const sort = pgld ? pgld.ListProduct : [];
          this.productsList = sort.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
          this.progressBarService.hide();
        }
      });
  }
  private fragment: string;

  Configx = { multi: false };

  menus: Menu[] = [
    {
      name: 'Description',
      active: true

    },
    {
      name: 'Rating & Reviews',
      active: false
    },
    {
      name: 'Write A Review',
      active: false
    }
  ];
  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
    const storeid = this.route.snapshot.paramMap.get('storeid');
    if (storeid !== localStorage.getItem('storeId')) {
      localStorage.setItem('storeId', storeid);
      // this.onStoreChange(storeid);
      this.commonService.currentStoreid.next(storeid);
    } else {
      this.qty = 1;
      this.rating = 0;
      this.productDetails = null;
      this.productsList = [];
      this.getProductDetails();
    }

  }
  onStoreChange(storeId) {
    this.appConfig.storeID = storeId;
    this.toastr.error('please wait, we are switching the store');

  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    try {
      document.querySelector('#' + this.fragment).scrollIntoView({ behavior: 'smooth' });
    } catch (e) { }
  }

  scroll(el: HTMLElement) {
    this.MyProp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // el.scrollIntoView({behavior: 'smooth'});
  }

  scrolltoWrite(el: HTMLElement) {
    this.WriteAR.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  scrollWriteReviewsMob() {
    document.querySelector('#headingThree').scrollIntoView({ behavior: 'smooth' });
    this.toggle(2, 'Rewiew');
  }
  scrollMob() {
    document.querySelector('#headingTwo').scrollIntoView({ behavior: 'smooth' });
    this.toggle(1, 'Rating');
  }

  getProductDetails() {
    
    this.progressBarService.show();
    const productId = +this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.store.dispatch(new ProductGetDetails(this.productStoreService.getProductGetDetailsParams(productId)));
    }
  }
  getalluserReviews() {
    this.progressBarService.show();
    this.productStoreService.getReviewList(this.productDetails.Product.PID, 1, this.totalcount).subscribe(
      (data: any) => {
        this.userReviews = [];
        this.progressBarService.hide();
        this.moreReviews = data.ListReview;
        this.userReviews = [...data.ListReview];
      });
  }
  getMoreReviews() {
    if (this.moreReviews) {
      this.countshow = this.countshow + 4;
      return;
    }

  }

  onEdit(review: any) {
    this.isEdit = true;
    this.review = review;
    document.querySelector('#reviews').scrollIntoView({ behavior: 'smooth' });
  }
  onAddReview() {
    this.reviewAdded = true;
    this.getProductDetails();
  }
  onUpdateReview() {
    this.isEdit = false;
    this.getProductDetails();
  }
  onRated(rating: number) {
    // console.log(rating);
  }

  getRelatedProducts() {
if( this.productDetails.CategoryId !== 5) {
    
this.getMenuFilters();
    if ((this.productDetails.CategoryId === 3 || this.productDetails.CategoryId === 1) && this.productDetails.Varietal !== '') {
      this.varietalId = this.getVarietalId(this.productDetails.Varietal);
    } else {
      this.typeId = this.getTypeId(this.productDetails.Type);
    }

    this.getProductList();
  } else {
    this.productsList=[];
  }
} 
onchangequantity(){
  if(this.qty > this.productDetails.Product.Inventory){
         const obj = {ProductImage:this.productDetails.Product.ProductImg, ProductName: this.productDetails.Product.ProductName, QuantityOrdered:this.qty,Quantity:this.productDetails.Product.Inventory};
         this.reviewItems.push(obj);
         this.openModal.nativeElement.click();
  }
  
}
onPopupClose() {
  this.qty = this.productDetails.Product.Inventory;
  this.reviewItems =[];
}
  getProductList() {
    this.progressBarService.show();
    this.store.dispatch(new ProductGetList(
      this.productStoreService.getProductGetListParams(
        {
          categoryId: this.productDetails.CategoryId, varietalId: this.varietalId,
          typeId: this.typeId, pageSize: 4, pageNumber: ++this.pageNumber
        })));
  }

  addToCart() {
    if (this.productDetails && this.productDetails.Product &&
      this.productDetails.Product.PID && this.qty) {
      this.progressBarService.show();
      this.cartService.addToCard(this.productDetails.Product.PID, this.qty).subscribe(
        (data: any) => {
          this.cartService.cartItemCount.next(data.CartItemCount);
          this.toastr.success(data.SuccessMessage);
          this.progressBarService.hide();
          this.getProductDetails();
        });
    }
    if(this.productDetails.Product.PID.toString()===localStorage.getItem('EventsProductId')){
      this.commonService.eventsProductAddedToCart=true;
    }
  }

  removeFromCart() {
    if (this.productDetails && this.productDetails.Product &&
      this.productDetails.Product.PID) {

      this.progressBarService.show();
      this.cartService.removeFromCart(this.productDetails.Product).subscribe(
        (data: any) => {
          this.cartService.cartItemCount.next(data.CartItemCount);
          this.progressBarService.hide();
          this.toastr.success(data.SuccessMessage);
          this.qty = 1;
          this.getProductDetails();
        });
    };
    if(this.productDetails.Product.PID.toString()===localStorage.getItem('EventsProductId')){
      this.commonService.eventsProductAddedToCart=false;
      localStorage.removeItem('EventsProductId');
      localStorage.removeItem('PromotionTitle');

    };
  }

  getTypeId(typeName: string) {
    if (this.allFilters && this.allFilters.type) {
      const type = this.allFilters.type.filter(item => item.value === typeName)[0];
      if (type) {
        return type.id;
      }
      return '';
    }
  }

  getVarietalId(varietalName: string) {
    if (this.allFilters && this.allFilters.type) {
      const varietal = this.allFilters.type.reduce((acc, item) => [...acc, ...item.varietals], [])
        .filter(varietalItem => varietalItem.value === varietalName)[0];
      // const varietal = this.allFilters.type.filter(item => item.value === varietalName)[0];
      if (varietal) {
        return varietal.id;
      }
      return 0;
    }
  }

  getMenuFilters() {
    this.dataservice.categoryId = this.productDetails.CategoryId;
    this.dataservice.getFiltersByCategory();
    this.allFilters = this.dataservice.filtersAllData;
  }

  favoriteProductUpdate(status: boolean) {
    
    this.progressBarService.show();
    this.productStoreService.favoriteProductUpdate(this.productDetails.Product.PID, status).subscribe(
      (data: any) => {
        this.productDetails.Product.IsFavorite = data.IsFavorite;
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }

  getQty(item: any) {
    if (item && item.DealId !== 0 && item.IsBottleLimitAtRetail === false && item.DealInventory > 0) {
      return this.quantity.filter(qty => qty <= item.DealInventory);
    }
    return this.quantity;
  }
  toggle(index: number, from: string) {
    if (!this.Configx.multi) {
      this.menus.filter(
        (menu, i) => i !== index && menu.active
      ).forEach(menu => menu.active = !menu.active);
    }

    if (from === 'Rewiew' || from === 'Rating') {
      this.menus[index].active = true;

    } else {
      this.menus[index].active = !this.menus[index].active;
    }

  }

}

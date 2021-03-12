import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProductGetListRequestPayload } from 'src/app/models/product-get-list-request-payload';
import { CartService } from 'src/app/services/cart.service';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ProgressBarService } from 'src/app/shared/services/progress-bar.service';
import { ProductGetList } from 'src/app/state/product-store/product-store.action';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';

@Component({
  selector: 'app-landingstaff-top-picks',
  templateUrl: './landingstaff-top-picks.component.html',
  styleUrls: ['./landingstaff-top-picks.component.scss']
})
export class LandingstaffTopPicksComponent implements OnInit {
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
  reqParams:any;
  currentPageNo = 1;
  pageSize = 12;
  currentCategoryId = '1,2,3,4';
  topBeerListProduct=[];
  topLiquorListProduct=[];
  topWineListProduct=[];
  responseData: any;
  productsList=[];
  menuOptions: any;
  catId=[];
  constructor(private store: Store<ProductGetListRequestPayload>,
    private productStoreService: ProductStoreService,
    private router: Router,private commonService: CommonService,
    private progressBarService: ProgressBarService,
    private cartService: CartService)  {
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if(pssd !== null){
          this.menuOptions = pssd;
          this.catId = [];
          for(let i = 0; i<this.menuOptions.StoreFilters.length; i++){
            if(this.menuOptions.StoreFilters[i].CategoryId<4){
              this.catId.push(this.menuOptions.StoreFilters[i].CategoryId);
            }
          }this.commonService.categoryId = '';
          this.commonService.categoryId = this.catId.toString();
           this.getTopPicksProducts();
        }
      });
     }

  ngOnInit() {
    this.getStaffPicksProducts();
    if(this.commonService.categoryId !==''){
      this.getTopPicksProducts();
    }
  }
  getStaffPicksProducts() {
    this.progressBarService.show();
      this.reqParams =this.productStoreService.getProductGetListParams(
        { categoryId: this.currentCategoryId, pageSize: this.pageSize, isFeatured: 0,isStaffPicks: 0,ProductType:2, pageNumber: this.currentPageNo });
        this.productStoreService.staffPicksGetList(this.reqParams).subscribe((data:any)=>{
          this.responseData = data;
          this.commonService.staffPicksTitle.next(this.responseData.StaffPicksTitle);
          this.productsList = data.ListProduct.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
        });
      }
  getTopPicksProducts() {
    this.progressBarService.show();
    this.productStoreService.catid = this.commonService.categoryId;
      const reqParams = this.productStoreService.getTopPicksListParams(
        { categoryId: this.commonService.categoryId, pageSize: this.pageSize,pageNumber: this.currentPageNo });
      
    this.productStoreService.topPicksGetList(reqParams).subscribe((data) => {
      if (data) {
        this.progressBarService.hide();
        this.topBeerListProduct = data && data.TopBeerListProduct ? data.TopBeerListProduct : [];
        this.topLiquorListProduct = data && data.TopLiquorListProduct ? data.TopLiquorListProduct : [];
        this.topWineListProduct = data && data.TopWineListProduct ? data.TopWineListProduct : [];
      }

    });
  }
}

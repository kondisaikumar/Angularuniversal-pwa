import { Component, OnInit, Inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { ProductGetListRequestPayload } from '../../../models/product-get-list-request-payload';
import { ProductGetList } from '../../../state/product-store/product-store.action';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { CartService } from '../../../services/cart.service';
//  
import { ToastrService } from 'ngx-toastr';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { PLATFORM_ID } from '@angular/core';
@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit {
  productsList: any[];
  isPrevious = false;
  isNext = false;
  currentPageNo = 1;
  pageSize = 12;
  totalCount = 0;
  storeid: any;

  constructor(private store: Store<ProductGetListRequestPayload>,
    private productStoreService: ProductStoreService,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: object,
    private toastr: ToastrService,
    private progressBarService: ProgressBarService) {
    this.store.select(ProductStoreSelectors.productGetListData)
      .subscribe(pgld => {
        if (pgld) {
          const sort = pgld ? pgld.ListProduct : [];
          this.productsList = sort.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
          this.totalCount = pgld.TotalCount || 0;

          if (this.productsList.length > 0 && this.totalCount > (this.currentPageNo * this.pageSize)) {
            this.isNext = true;
          } else {
            this.isNext = false;
          }

          if (this.productsList.length > 0 && this.currentPageNo > 1) {
            this.isPrevious = true;
          } else {
            this.isPrevious = false;
          }
          this.progressBarService.hide();
          
        }
      });
  }

  ngOnInit() {
    this.storeid = localStorage.getItem('storeId');
    this.productsList = [];
    
    this.progressBarService.show();
    this.getFavoriteProducts();
  }

  getFavoriteProducts() {
    this.store.dispatch(new ProductGetList(this.productStoreService.getProductGetListParams({
      isFavorite: 1, pageSize: this.pageSize, pageNumber: this.currentPageNo
    })));
  }
  favoriteProductUpdate(item: any, status: boolean) {
    
    this.progressBarService.show();
    this.productStoreService.favoriteProductUpdate(item.PID, status).subscribe(
      (data: any) => {
        this.productStoreService.isFavoritesUpdated = true;
        item.IsFavorite = data.IsFavorite;
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
        if ((this.totalCount - 1) === this.pageSize) {
          this.currentPageNo -= 1;
        }
        this.getFavoriteProducts();
      });
  }

  addToCart(item: any) {
    
    this.progressBarService.show();
    this.cartService.addToCard(item.PID, 1).subscribe(
      (data: any) => {
        item.InCart = 1;
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }

  removeFromCart(item: any) {
    
    this.progressBarService.show();
    this.cartService.removeFromCart(item).subscribe(
      (data: any) => {
        item.InCart = 0;
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }
  getCount(n: number): any[] {
    return Array(n);
  }

  showMoreProducts() {
    this.currentPageNo += 1;
    this.getFavoriteProducts();
  }

  showPreviousProducts() {
    if (this.currentPageNo > 1) {
      this.currentPageNo -= 1;
      this.getFavoriteProducts();
    }
  }

}

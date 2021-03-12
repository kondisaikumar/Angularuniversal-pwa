import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ProductGetListRequestPayload } from 'src/app/models/product-get-list-request-payload';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ProgressBarService } from 'src/app/shared/services/progress-bar.service';
import { ProductGetList } from 'src/app/state/product-store/product-store.action';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';

@Component({
  selector: 'app-staffpicks',
  templateUrl: './staffpicks.component.html',
  styleUrls: ['./staffpicks.component.scss']
})
export class StaffpicksComponent implements OnInit {
  currentPageNo = 1;
  pageSize = 12;
  selectedPageSize= 12;
  page = 1;
  PageSize = [12, 24, 36, 48, 60, 72, 84, 96];
  currentCategoryId = '1,2,3,4';
  responseData: any;
  productsList = [];
  reqParams:any;
  constructor(private progressBarService: ProgressBarService,
    private store: Store<ProductGetListRequestPayload>, private commonService: CommonService,
    private productStoreService: ProductStoreService,
    private router: Router) {

     }

  ngOnInit() {
    this.getStaffPicksProducts();
  }
  getStaffPicksProducts() {
    this.progressBarService.show();
    this.reqParams= this.productStoreService.getProductGetListParams(
        { categoryId: this.currentCategoryId, pageSize: this.pageSize, isFeatured: 0, isStaffPicks: 0,ProductType:2, pageNumber: this.currentPageNo });
        this.productStoreService.staffPicksGetList(this.reqParams).subscribe((data:any)=>{
          this.progressBarService.hide();
          this.responseData = data;
          this.commonService.staffPicksTitle.next(this.responseData.StaffPicksTitle);
          this.productsList = data.ListProduct.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
  
        })

      }
  onPageChange(pageNo) {
    this.currentPageNo = pageNo;
    this.getStaffPicksProducts();
  }
  onPageSizeChange(){
    this.pageSize = this.selectedPageSize;
    this.getStaffPicksProducts();
  }
}

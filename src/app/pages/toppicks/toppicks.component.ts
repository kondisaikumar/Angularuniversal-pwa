import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductStoreService } from '../../services/product-store.service';
import { ProgressBarService } from '../../shared/services/progress-bar.service';

@Component({
  selector: 'app-toppicks',
  templateUrl: './toppicks.component.html',
  styleUrls: ['./toppicks.component.scss']
})
export class ToppicksComponent implements OnInit {
  selectedPageSize= 12;
  productlists =[];
  page = 1;
  responseData: any;
  PageSize = [12, 24, 36, 48, 60, 72, 84, 96];
  currentPageNo: 1;
  constructor(private router: Router,private progressBarService: ProgressBarService, private productStoreService: ProductStoreService) { }

  ngOnInit() {
    this.getTopPicksProducts();
  }
  getTopPicksProducts() {
    this.progressBarService.show();
    this.productStoreService.catid = this.router.url==='/top-beer' ? '1' :this.router.url==='/top-liquor' ? '2' :this.router.url==='/top-wine'?'3':'';
    const reqParams = this.productStoreService.getTopPicksListParams(
      { categoryId: this.productStoreService.catid, pageSize: this.selectedPageSize,pageNumber: this.currentPageNo });
    this.productStoreService.topPicksGetList(reqParams).subscribe((data) => {
      if (data) {
        this.progressBarService.hide();
        this.responseData = data;
        if(this.router.url==='/top-beer'){
          this.productlists = data && data.TopBeerListProduct ? data.TopBeerListProduct : [];}
        if(this.router.url==='/top-liquor'){
          this.productlists = data && data.TopLiquorListProduct ? data.TopLiquorListProduct : [];}
        if(this.router.url==='/top-wine'){
          this.productlists = data && data.TopWineListProduct ? data.TopWineListProduct : [];
        }
      }

    });
  }
  onPageChange(pageNo) {
    this.currentPageNo = pageNo;
    this.getTopPicksProducts();
  }
  onPageSizeChange(){
    this.getTopPicksProducts();
  }
}

import { Component, OnChanges, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductStoreService } from 'src/app/services/product-store.service';


@Component({
  selector: 'app-multi-store',
  templateUrl: './multi-store.component.html',
  styleUrls: ['./multi-store.component.scss']
})
export class MultiStoreComponent implements OnChanges {
  @Input() stores: any;
  @Input() currentStore: any;
  @Output() storeChange = new EventEmitter<number>();
  @ViewChild('openModal') openModal: ElementRef;
  searchText: string;
  tempStores: any;

  constructor(private commonService: CommonService, private storeService: ProductStoreService,
     private router: Router) {
    this.commonService.currentStoreid.subscribe((res: any) => {
      this.onStoreSelectConfirm(res, 'unclicked');
    });
  }

  ngOnChanges() {
  }

  /* onStoreSelect(storeId: number) {
    this.currentStore = storeId;
  } */

  onStoreSelectConfirm(storeId: number, value: any) {
      this.storeService.orderType ="";
    if (value === 'clicked') {
      this.commonService.multistoreclicked.next('clicked');
    

    } else {
      this.commonService.multistoreclicked.next('unclicked');

    }
    this.currentStore = storeId;
    localStorage.setItem('storeId', this.currentStore.toString());
    this.storeChange.emit(this.currentStore);
   
    
    if (value === 'clicked') {
        this.router.navigateByUrl['/'];
      this.openModal.nativeElement.click();
    } 
  }


  filterBySearchText() {
    if (this.stores && !this.tempStores) {
      this.tempStores = this.stores.map(obj => {
        const rObj = {
          'StoreId': obj.StoreId,
          'Address1': obj.Address1,
          'Address2': obj.Address2,
          'City': obj.City,
          'Location': obj.Location,
          'Phone': obj.Phone,
          'State': obj.State,
          'ContactNo': obj.ContactNo,
          'StoreName': obj.StoreName,
          'Zip': obj.Zip,
          'StoreImage': obj.StoreImage
        };
        return rObj;
      });
    }
    // console.log(this.searchText);

    this.stores = this.tempStores;
    this.stores = this.stores.filter(item =>
      Object.keys(item).some(k => item[k] != null &&
        item[k].toString().toLowerCase()
          .includes(this.searchText.toLowerCase()))
    );
  }

}

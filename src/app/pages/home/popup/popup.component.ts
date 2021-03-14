import { Component, ElementRef, ViewChild, OnInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { CustomerLogin } from '../../../state/customer/customer.action';
import { CustomerSelectors } from '../../../state/customer/customer.selector';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { AppConfigService } from '../../../app-config.service';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { ProductStoreService } from '../../../services/product-store.service';
import { SessionService } from '../../../shared/services/session.service';
import { CommonService } from '../../../shared/services/common.service';
import { MapsAPILoader } from '@agm/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  @ViewChild('openModal') openModal: ElementRef;

  isAgeVerified = false;
  currentStoreId = 0;
  storeList: any;
  searchText: string;
  tempStores: any;

  initialStoreId = 0;
  geoCoder: google.maps.Geocoder;
  storeslistmiles = [];

  getlocation=true;
  constructor(private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private store: Store<CustomerLoginSession>,
    private appConfig: AppConfigService,
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private progressBarService: ProgressBarService,
    private storeService: ProductStoreService,
    private sessionService: SessionService,
    private commonService: CommonService) {

    this.store.select(CustomerSelectors.customerLoginSessionData)
    .subscribe(clsd => {
      if (clsd) {
        if (!localStorage.getItem('storeId') && clsd.StoreId !== 0) {
          localStorage.setItem('storeId', clsd.StoreId.toString());
          this.currentStoreId = clsd.StoreId;
        } else if (!localStorage.getItem('storeId') && clsd.StoreId === 0) {
          localStorage.setItem('storeId', this.appConfig.appID.toString());
          this.onStoreSelectConfirm(this.appConfig.appID);
        }
        this.getStoreList();
      }
    });

  }

  ngOnInit() {

    this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));

    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
   });
  
   
 

  }
  calculateDistance(latlng: any) {
    const searchLocation = new google.maps.LatLng(latlng.lat, latlng.lng);
    this.storeList.forEach((item => {
      const store = new google.maps.LatLng(item.Latitude, item.Longitude);
      let distance = google.maps.geometry.spherical.computeDistanceBetween(store, searchLocation);

      if (distance) {
        distance = distance / 1609.344;
        this.storeslistmiles.push({'miles' : distance, 'store': item});

        }
      })
    );
    this.currentStoreId = this.storeslistmiles[1].store.StoreId;
   this.onStoreSelectConfirm(this.storeslistmiles[1].store.StoreId);
  }

  onAgeVerified(data) {
    this.isAgeVerified = data;
    if (this.isAgeVerified && this.currentStoreId !== 0) {
      this.commonService.onCacheUpdated();
      // this.sessionService.createNewSession();

      this.openModal.nativeElement.click();
    }
    if (this.isAgeVerified && this.route.snapshot.queryParamMap.get('returnUrl')) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl.startsWith('/product-details')) {
        const lastindex = returnUrl.lastIndexOf('/');
        const id = returnUrl.substr(lastindex + 1, );
        const storeid = +id;
        this.openModal.nativeElement.click();
      this.onStoreSelectConfirm(storeid);

      // tslint:disable-next-line:max-line-length
      } else if (returnUrl.startsWith('/beer') || returnUrl.startsWith('/wine') || returnUrl.startsWith('/liquor') || returnUrl.startsWith('/mixers-more')|| returnUrl.startsWith('/tobacco') || returnUrl.startsWith('/advance-filter')) {
        const params = returnUrl.indexOf('?');
        const replaceAnd = returnUrl.substring(params, );
        const url = returnUrl.substring(0, params);
        const query = {};
        const pairs = (replaceAnd[0] === '?' ? replaceAnd.substr(1) : replaceAnd).split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        const storeid = +query['storeid'];
        this.openModal.nativeElement.click();
        this.onStoreSelectConfirm(storeid);
      }
    }
  }

  getStoreList() {
    this.progressBarService.show();
    this.storeService.storeGetList().subscribe(data => {
      if (data && data.ListStore) {
        this.currentStoreId = data.StoreId;
        this.initialStoreId = data.StoreId;

        const sList = data.ListStore;
        const fromIndex = sList.findIndex(item => item.StoreId === this.currentStoreId);

        if (fromIndex !== -1) {
          const element = sList[fromIndex];
          sList.splice(fromIndex, 1);
          sList.splice(0, 0, element);
        }

        this.storeList = sList;
        if(sList.length > 1 && this.getlocation){
          this.getlocation=false;
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              const latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
              
              if (latlng) {
                this.calculateDistance(latlng);
              }});
            }
        }
        this.progressBarService.hide();
      }
    });
  }

  /* onStoreSelect(storeId: number) {
    this.currentStoreId = storeId;
    // this.storeChange.emit(storeId);
  } */
  onStoreSelectConfirm(storeId: number) {
    this.currentStoreId = storeId;
    localStorage.setItem('storeId', this.currentStoreId.toString());
    this.appConfig.storeID = this.currentStoreId;
    this.sessionService.createNewSession();
    this.commonService.onCacheUpdated();
  }

  filterBySearchText() {
    if (this.storeList && !this.tempStores) {
      this.tempStores = this.storeList.map(obj => {
        const rObj = {
          'StoreId' : obj.StoreId,
          'Address1': obj.Address1,
          'Address2': obj.Address2,
          'City': obj.City,
          'Location' : obj.Location,
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

    this.storeList = this.tempStores;
    this.storeList = this.storeList.filter(item =>
      Object.keys(item).some(k => item[k] != null &&
        item[k].toString().toLowerCase()
          .includes(this.searchText.toLowerCase()))
    );
  }
}

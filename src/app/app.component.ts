import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import SmartBanner from 'smart-app-banner';
import { SmartBannerInfo, AppConfigService } from './app-config.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonService } from './shared/services/common.service';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from './models/customer-login-session';
import { CustomerSelectors } from './state/customer/customer.selector';
import { ProgressBarService } from './shared/services/progress-bar.service';
import { ProductStoreService } from './services/product-store.service';
import { SessionService } from './shared/services/session.service';
import { CustomerLogin } from './state/customer/customer.action';
import { MapsAPILoader } from '@agm/core';
import * as CryptoJS from 'crypto-js';
import { baseUrl } from './services/url-provider';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('openModal') openModal: ElementRef;
  title = 'TeamBottlecApps';
  sorryPopup = false;
  isMobile: boolean;
  storeId = 0;
  currentStoreId = 0;
  storeList: any;
  storeslistmiles = [];
  storeslistm = [];
  initialStoreId = 0;
  // isAgeVerified = false;
  geoCoder: google.maps.Geocoder;
  legalDate: Date;
  returnUrl: any;
  customerSession: CustomerLoginSession;
  storeChangeClicked: any='';
  constructor(
     private appConfig: AppConfigService,
     private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: object,
    private progressBarService: ProgressBarService,
    private router: Router,
    private _title:Title,
    private _meta:Meta,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private storeService: ProductStoreService,
    private store: Store<CustomerLoginSession>,
    private commonService: CommonService) {

   this.commonService.multistoreclicked.subscribe(res=>this.storeChangeClicked=res);
      this.store.select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        // this.commonService.agePopUp.subscribe((res: any) => {
        //   this.openModal.nativeElement.click();
        // });
        if (isPlatformBrowser(this.platformId)) {
        if (clsd) {
          this.customerSession = clsd;
          if (!localStorage.getItem('storeId') && clsd.StoreId !== 0) {
            localStorage.setItem('storeId', clsd.StoreId.toString());
            this.currentStoreId = clsd.StoreId;
          } else if (!localStorage.getItem('storeId') && clsd.StoreId === 0) {
            localStorage.setItem('storeId', this.appConfig.appID.toString());
            this.onStoreSelectConfirm(this.appConfig.appID);
          }
          this.getStoreList();
        }
      }
      });
    new SmartBanner({
      daysHidden: 0,   // days to hide banner after close button is clicked (defaults to 15)
      daysReminder: 0, // days to hide banner after "VIEW" button is clicked (defaults to 90)
      appStoreLanguage: 'us', // language code for the App Store (defaults to user's browser language)
      title: SmartBannerInfo.title,
      author: SmartBannerInfo.author,
      button: 'View',
      store: {
        android: 'On the Google Play'
      },
      price: {
        android: 'GET'
      }
    });

    this.commonService.cacheUpdated.subscribe(() => {
      this.verifyCache();
    });
  }
  sorryclick() {
    this.sorryPopup = true;
  }
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
   if(this.storeChangeClicked!=='clicked'){
    const storeId = this.route.snapshot.queryParams['storeID'];
    if (storeId) {
      this.appConfig.appID = 0;
      this.appConfig.storeID = +storeId;
    }
    const isSignIn = localStorage.getItem('isSignIn');
    const sourceId = localStorage.getItem('sourceId');

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (!(this.customerSession && this.customerSession.SessionId) && (isSignIn === '1' || isSignIn === null)) {
      

      let demail = sessionStorage.getItem('email');
      let dpass = sessionStorage.getItem('password');

      if (demail && dpass) {
        demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
      } else {
        demail = localStorage.getItem('email');
        dpass = localStorage.getItem('password');

        try {
          if (demail && dpass) {
            demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
            dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
          }
        } catch {
          sessionStorage.removeItem('email');
          sessionStorage.removeItem('password');

          localStorage.removeItem('email');
          localStorage.removeItem('password');
          localStorage.removeItem('isSignIn');
          localStorage.removeItem('rememberMe');
          this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
        }

      }

      this.progressBarService.show();
      if (demail && dpass) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, dpass, 'E')));
      } else if (demail && sourceId) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, '' , 'F', sourceId)));
      } else {
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('password');

        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('isSignIn');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('sourceId');
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
      }
    } else if (!(this.customerSession && this.customerSession.SessionId) && (isSignIn === '0')) {
      this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
    }
   }
    




    this.legalDate = new Date(new Date().getFullYear() - 21, new Date().getMonth(), new Date().getDate());
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
   });



    this.verifyCache();
  }
  }
  onAgeVarify() {
    this.commonService.ageverify.next(true);
    if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('isAgeVerified', 'true');
    }
  }
  onStoreSelectConfirm(storeId: number) {
    if (isPlatformBrowser(this.platformId)) {
    this.currentStoreId = storeId;
    localStorage.setItem('storeId', this.currentStoreId.toString());
    this.appConfig.storeID = this.currentStoreId;
    this.sessionService.createNewSession();
    this.commonService.onCacheUpdated();
    }
  }
  ngAfterViewInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).ga('set', 'page', event.urlAfterRedirects);
        (<any>window).ga('send', 'pageview');
      }
    });
    if (isPlatformBrowser(this.platformId)) {
    if (!localStorage.getItem('isAgeVerified')) {
      setTimeout(() => {
        this.openModal.nativeElement.click();
      }, 7000);
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
        if(this.storeList.length > 1){
          if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('singlestore', 'no');
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              const latlng = {lat: position.coords.latitude, lng: position.coords.longitude};
            
              if (latlng && !localStorage.getItem('geolocation')) {
                localStorage.setItem('geolocation', 'true');
                this.calculateDistance(latlng);
              }});
            }
          }
        }else if(this.storeList.length === 1){
          if (isPlatformBrowser(this.platformId)) {
          if(!localStorage.getItem('singlestore')){
          localStorage.setItem('singlestore', 'yes');
          this.currentStoreId = this.storeList[0].StoreId;
          this.onStoreSelectConfirm(this.storeList[0].StoreId);
          }
        }
          
          }
        this.progressBarService.hide();
      }
    });
  }


  verifyCache() {
    if (isPlatformBrowser(this.platformId)) {
    if (localStorage.getItem('storeId')) {
      this.storeId = +localStorage.getItem('storeId');
    }

    if (this.route.snapshot.queryParamMap.get('returnUrl')) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      if (returnUrl.startsWith('/product-details')) {
        const lastindex = returnUrl.lastIndexOf('/');
        const id = returnUrl.substr(lastindex + 1, );
        const storeid = +id;
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
        this.onStoreSelectConfirm(storeid);
      }
    } else {
      if (
        !this.storeId ||
        this.storeId === 0
      ) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
      }
    }
  }
    }
    calculateDistance(latlng: any) {
      const searchLocation = new google.maps.LatLng(latlng.lat, latlng.lng);
      this.storeList.forEach((item => {
        const store = new google.maps.LatLng(item.Latitude, item.Longitude);
        let distance = google.maps.geometry.spherical.computeDistanceBetween(store, searchLocation);

        if (distance) {
          distance = distance / 1609.344;
          this.storeslistm.push({'miles' : distance, 'store': item});
          this.storeslistmiles = this.storeslistm.sort((x, y) => x.miles < y.miles ? -1 : 1);

          }
        })
      );
      this.currentStoreId = this.storeslistmiles[0].store.StoreId;
      if (this.route.snapshot.queryParamMap.get('storeid') || this.route.snapshot.paramMap.get('storeid')) {

      } else {
        this.onStoreSelectConfirm(this.storeslistmiles[0].store.StoreId);
      }

    }
}

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { CustomerLogin } from '../../../state/customer/customer.action';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { CustomerSelectors } from '../../../state/customer/customer.selector';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { CustomerService } from '../../../services/customer.service';
import { CartService } from '../../../services/cart.service';
import { Router } from '@angular/router';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import * as CryptoJS from 'crypto-js';
import { baseUrl } from '../../../services/url-provider';
import { AppConfigService } from '../../../app-config.service';
import * as $ from 'jquery';
import { DataService } from '../../../services/data.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { BannerService } from 'src/app/services/banner.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('openMultiLocationModal') openModal: ElementRef;
  customerSession: CustomerLoginSession;
  storeGetHomeData: any;
  cartItemCount = 0;
  isActive = false;
  profileFirstLetter = '';
  profilePic = 'assets/Images/profile.png';
  storeList: any;
  isMobile: boolean;
  storeDetails: any;
  currentStoreId = '';
  couponAvailable = false;
  isClicked: boolean;
  inputIsFocus = false;
  changestorepopoverlay: boolean;
  filterMenuItems: any;
  staffpicksTitle= '';
  constructor(private store: Store<CustomerLoginSession>,
    private commonService: CommonService,
    private customerService: CustomerService,
    private cartService: CartService,
    private dataservice: DataService,
    private router: Router,
    private storeService: ProductStoreService,
    private progressBarService: ProgressBarService,
    private appConfig: AppConfigService, private banerService: BannerService
    ) {

    this.store.select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        if (clsd) {
          this.customerSession = clsd;
          this.progressBarService.hide();

          if (this.customerSession && this.customerSession.UserId !== 0) {
            this.isActive = true;
          } else {
            this.isActive = false;
          }
          this.getStoreDetails();
          this.banerService.getBannerDetails().subscribe((res)=>{
            if(res !== null){
              if(res.ListBanner){
                for(let i = 0; i < res.ListBanner.length; i++) {
                this.banerService.bannerAndPromotionClicks(res.ListBanner[i].BannerId,'B','V').subscribe((res)=>{
                });
              }
            }
            }
          })
        }
      });
     this.commonService.ageverify.subscribe(() => {
      if (this.storeList && this.storeList.length > 1) {
        this.changestorepopoverlay = true;
        setTimeout(() => {
          this.changestorepopoverlay = false;
        }, 2000);
                }
     });
     this.commonService.staffPicksTitle.subscribe((data:any)=>{
      this.staffpicksTitle=data;
     })
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          this.filterMenuItems = this.storeGetHomeData['StoreFilters'];
          this.commonService.agePopUp.next();
          if (pssd && pssd.IsCouponAvailable) {
            this.couponAvailable = pssd.IsCouponAvailable;
          }
          this.getStoreList();

          if (this.storeGetHomeData.CustomerInfo && this.storeGetHomeData.CustomerInfo.ProfileImage !== '') {
            this.profilePic = this.storeGetHomeData.CustomerInfo.ProfileImage;
          } else if (this.storeGetHomeData.CustomerInfo && this.storeGetHomeData.CustomerInfo.FirstName) {
            this.profileFirstLetter = this.storeGetHomeData.CustomerInfo.FirstName.substr(0, 1);
          } else if (this.storeGetHomeData.CustomerInfo && this.storeGetHomeData.CustomerInfo.EmailId) {
            this.profileFirstLetter = this.storeGetHomeData.CustomerInfo.EmailId.substr(0, 1);
          }
        }

      });

    this.progressBarService.show();
    this.cartService.cartItemCount.subscribe((data) => {
      this.cartItemCount = data;
      this.progressBarService.hide();
    });

    this.customerService.profileUpdated.subscribe(() => {
      this.progressBarService.show();
      this.customerService.getProfileDetails().subscribe(
        (data: any) => {
          const profile = data;
          this.progressBarService.hide();

          if (profile && profile.ProfileImage !== '') {
            this.profilePic = profile.ProfileImage;
          } else if (profile && profile.FirstName) {
            this.profileFirstLetter = profile.FirstName.substr(0, 1);
          } else if (profile && profile.EmailId) {
            this.profileFirstLetter = profile.EmailId.substr(0, 1);
          }

        });
    });
  }

  ngOnInit() {
    $('.m-menu').click(function (e) {
      e.stopPropagation();
      $('#hide-menu').toggleClass('show-menu');
    });

    $('#hide-menu').click(function (e) {
      e.stopPropagation();
    });

    $('body,html,li a').click(function (e) {
      $('#hide-menu').removeClass('show-menu');
      $('#nav-icon4').removeClass('open');
    });

    $(document).ready(function () {
      $('#nav-icon4').click(function () {
        $(this).toggleClass('open');
      });
    });
  }

  closeNav() {
    $('#hide-menu').removeClass('show-menu');
    $('#nav-icon4').removeClass('open');

  }

  openMultiLocationDialog() {
    this.openModal.nativeElement.click();
  }
  inputfocus(e) {
   this.inputIsFocus = e;
  }

  getStoreList() {
    this.progressBarService.show();
    this.storeService.storeGetList().subscribe(data => {
      if (data && data.ListStore) {
        this.currentStoreId = data.StoreId;

        const sList = data.ListStore;
        const fromIndex = sList.findIndex(item => item.StoreId === this.currentStoreId);

        if (fromIndex !== -1)  {
          const element = sList[fromIndex];
          sList.splice(fromIndex, 1);
          sList.splice(0, 0, element);
        }

        this.storeList = sList;
        if (this.storeList.length > 1) {
this.changestorepopoverlay = true;
setTimeout(() => {
  this.changestorepopoverlay = false;
}, 2000);
        }
        this.commonService.storeList.next(sList);
        this.progressBarService.hide();
      }
    });
  }

  getStoreDetails() {
    this.progressBarService.show();
    this.storeService.getStoreDetails().subscribe(data => {
      if (data && data.GetStoredetails) {
        this.storeDetails = data.GetStoredetails;
      }
      this.progressBarService.hide();
    });
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
  onStoreChange(storeId) {
    this.appConfig.storeID = storeId;

    const sourceId = localStorage.getItem('sourceId');
    if(this.customerSession=== undefined){
   
      let demail = sessionStorage.getItem('email');
      let dpass = sessionStorage.getItem('password');

      if (demail && dpass) {
        demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
      } else {
        demail = localStorage.getItem('email');
        dpass = localStorage.getItem('password');

        if (demail && dpass) {
          demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
          dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        }
      }

      this.progressBarService.show();
      if (demail && dpass) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, dpass, 'E')));
      } else if (demail && sourceId) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, '' , 'F', sourceId)));
      } else {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
      }
    }
    if (this.customerSession && this.customerSession.SessionId) {

      let demail = sessionStorage.getItem('email');
      let dpass = sessionStorage.getItem('password');

      if (demail && dpass) {
        demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
      } else {
        demail = localStorage.getItem('email');
        dpass = localStorage.getItem('password');

        if (demail && dpass) {
          demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
          dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        }
      }

      this.progressBarService.show();
      if (demail && dpass) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, dpass, 'E')));
      } else if (demail && sourceId) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, '' , 'F', sourceId)));
      } else {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
      }
    }

    /* if (this.customerSession && this.customerSession.SessionId) {
      

      let demail = localStorage.getItem('email');
      let dpass = localStorage.getItem('password');

      if (demail && dpass) {
        demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
        dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(CryptoJS.enc.Utf8);
      }

      this.progressBarService.show();
      if (demail && dpass) {
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams(demail, dpass, 'E')));
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
      }
    }*/
  }
  Cartclicked(){
    this.storeService.orderType="";
  }
  onSignOut() {
    sessionStorage.clear();
    localStorage.setItem('isSignIn', '0');
    // localStorage.removeItem(key);  for removing a single item
    location.reload();
    this.store.dispatch(new CustomerLogin(this.appConfig.getLoginCustomerParams()));
    this.router.navigate(['/']);
  }
}

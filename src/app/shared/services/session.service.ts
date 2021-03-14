import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { baseUrl } from '../../services/url-provider';
import { ProgressBarService } from '../../shared/services/progress-bar.service';
import { CustomerLogin } from '../../state/customer/customer.action';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from '../../models/customer-login-session';
// import { CustomerService } from '../../services/customer.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../../app-config.service';
import { ToastrService } from 'ngx-toastr';
import { CustomerSelectors } from '../../state/customer/customer.selector';
import { Subject } from '../../../../node_modules/rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  advancefilter = new Subject<any>();
  multistoreclicked: any;

  constructor(
    private store: Store<CustomerLoginSession>,
    private progressBarService: ProgressBarService,
    private route: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private appConfig: AppConfigService,
    private commonService: CommonService,
    private toastr: ToastrService
  ) {
    this.store
      .select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        if (clsd) {
          if (
            // tslint:disable-next-line:max-line-length
            (this.route.url.startsWith('/checkout')||this.route.url.startsWith('/myaccount')||this.route.url==='/'||this.route.url.startsWith('/event-details')||this.route.url.startsWith('/feature-products') ||this.route.url.startsWith('/cart') || this.route.url.startsWith('/product-details') || this.route.url.startsWith('/beer') || this.route.url.startsWith('/liquor') || this.route.url.startsWith('/wine') || this.route.url.startsWith('/mixers-more')|| this.route.url.startsWith('/tobacco') || this.route.url.startsWith('/advance-filter')) &&
            this.multistoreclicked === 'clicked'
          ) {
            this.route.navigate(['/']);
          } else {
            if (
              // tslint:disable-next-line:max-line-length
            this.route.url.startsWith('/checkout')|| this.route.url.startsWith('/myaccount')||
            this.route.url.startsWith('/event-details') ||
            this.route.url.startsWith('/cart') ||
             this.route.url.startsWith('/product-details') || 
             this.route.url.startsWith('/beer')||
              this.route.url.startsWith('/tobacco') || 
             this.route.url.startsWith('/liquor') || 
             this.route.url.startsWith('/wine') || 
             this.route.url.startsWith('/mixers-more') || 
             this.route.url.startsWith('/advance-filter')
              
            ){
this.route.navigateByUrl(this.route.url);
            } else{
              this.route.navigate([this.route.url]);
            }
           
          }
        }
      });
    this.commonService.multistoreclicked.subscribe((res: any) => {
      this.multistoreclicked = res;
    });
  }

  createNewSession() {
    let demail = sessionStorage.getItem('email');
    let dpass = sessionStorage.getItem('password');
    const sourceId = localStorage.getItem('sourceId');

    if (demail && dpass) {
      demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(
        CryptoJS.enc.Utf8
      );
      dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(
        CryptoJS.enc.Utf8
      );
    } else if (demail && sourceId) {
      this.store.dispatch(
        new CustomerLogin(
          this.appConfig.getLoginCustomerParams(demail, '', 'F', sourceId)
        )
      );
    } else {
      demail = localStorage.getItem('email');
      dpass = localStorage.getItem('password');

      if (demail && dpass) {
        demail = CryptoJS.AES.decrypt(demail, baseUrl.substr(3)).toString(
          CryptoJS.enc.Utf8
        );
        dpass = CryptoJS.AES.decrypt(dpass, baseUrl.substr(3)).toString(
          CryptoJS.enc.Utf8
        );
      }
    }

    this.progressBarService.show();
    // this.toastr.info('Refreshing');
    if (demail && dpass) {
      this.store.dispatch(
        new CustomerLogin(
          this.appConfig.getLoginCustomerParams(demail, dpass, 'E')
        )
      );
    } else {
      localStorage.removeItem('email');
      localStorage.removeItem('password');
      localStorage.removeItem('isSignIn');
      localStorage.removeItem('rememberMe');
      this.store.dispatch(
        new CustomerLogin(this.appConfig.getLoginCustomerParams())
      );
    }
  }
}

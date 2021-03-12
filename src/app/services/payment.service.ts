import { Injectable } from '@angular/core';
import { Observable, of, throwError, EMPTY } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { switchMap, catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { PaymentProfile } from '../models/payment-profile';
import { CustomerSelectors } from '../state/customer/customer.selector';
import { CustomerLoginSession } from '../models/customer-login-session';
import { ProductStoreService } from './product-store.service';
import { Store } from '@ngrx/store';
import { AppConfigService, baseURL } from '../app-config.service';
import { baseUrl, UrlNames } from './url-provider';
import { CartService } from './cart.service';
import { CardValidProfile } from '../models/cardValidProfile';
import { CommonService } from '../shared/services/common.service';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  /* URL = 'https://apitest.authorize.net/xml/v1/request.api';
  merchantAuthentication = {
    vAppLoginId: '5Pj5hE6a',
    vTransactionKey: '77Za8R4Wnx988xQs'
  }; */
  headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  customerSession: CustomerLoginSession;
  customerInfo: any;
  createTransaction = {
    customerProfileId: '',
    customerPaymentProfileId: '',
    cvv: 0
  };

  constructor(private http: HttpClient, private commonservice: CommonService,
    private store: Store<CustomerLoginSession>,
    private errorHandler: ErrorHandlerService, private cartService: CartService, private cookieService: CookieService,
    private productService: ProductStoreService,
    private appConfig: AppConfigService) {
    this.store.select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        if (clsd) {
          this.customerSession = clsd;
        }
      });
    if (this.productService.customerInfo) {
      this.customerInfo = this.productService.customerInfo;
    }
  }

  createCustomerProfile(profile: PaymentProfile): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.getCreateCustomerProfileRequestPayload(profile), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  getCreateCustomerProfileRequestPayload(profile: PaymentProfile) {
    if (!this.customerSession && !this.customerInfo) {
      return null;
    }
const jsonObject = {
  'createCustomerProfileRequest': {
    'merchantAuthentication': {
      'name': this.appConfig.merchantAuthentication.vAppLoginId,
      'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
    },
    'profile': {
      'merchantCustomerId': this.customerSession.UserId,
      'description': profile.description,
      'email': this.customerInfo.EmailId || '',
      'paymentProfiles': {
        'customerType': profile.customerType,
        'billTo': {
          'firstName': profile.firstName,
          'lastName': profile.lastName,
          'address': profile.address,
          'city': profile.city,
          'state': profile.state,
          'zip': profile.zip,
          'country': profile.country,
          'phoneNumber': profile.phoneNumber || this.customerInfo.ContactNo
        },
        'payment': {
          'creditCard': {
            'cardNumber': profile.cardNumber,
            'expirationDate': profile.expirationDate
          }
        },
            'defaultPaymentProfile': profile.defaultPaymentProfile

          }
        },
        'validationMode': profile.validationMode
      }
    };
return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'CreateCustomerProfile',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'bin':profile.cardNumber.substring(0, 6) || 0,
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
    'DeviceType': 'W',
  'Request': JSON.stringify(jsonObject)
    };
  }

  createCustomerPaymentProfileRequest(profile: PaymentProfile): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.getCreateCustomerPaymentProfileRequestPayload(profile), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  getCreateCustomerPaymentProfileRequestPayload(profile: PaymentProfile) {
    if (!this.customerSession && !this.customerInfo) {
      return null;
    }
    const jsonObject = {
      'createCustomerPaymentProfileRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        'customerProfileId': profile.customerProfileId,
        'paymentProfile': {
          'billTo': {
            'firstName': profile.firstName,
            'lastName': profile.lastName,
            'address': profile.address,
            'city': profile.city,
            'state': profile.state,
            'zip': profile.zip,
            'country': profile.country,
            'phoneNumber': profile.phoneNumber
          },
          'payment': {
            'creditCard': {
              'cardNumber': profile.cardNumber,
              'expirationDate': profile.expirationDate
            }
          },
          'defaultPaymentProfile': profile.defaultPaymentProfile
        },
        'validationMode': profile.validationMode
      }
    };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'CreateCustomerPaymentProfile',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin':profile.cardNumber.substring(0, 6) || 0,
    'Request': JSON.stringify(jsonObject)
  };
  }
  getExistingCards(profileId: string): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize
      , this.getCustomerProfileRequestPayload(profileId), { headers: this.headers }).pipe(
      switchMap((res: any) => {
        return of(res);
      }),
      catchError((error: any, caught: Observable<any>) => {
        return this.errorHandler.processError(error);
      })
    );
  }

  getCustomerProfileRequestPayload(profileId: string) {
   const jsonObject = {
      'getCustomerProfileRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        'customerProfileId': profileId,
        'includeIssuerInfo': 'true'
      }
    };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'GetCustomerProfile',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin': 0,
    'Request': JSON.stringify(jsonObject)
    };
  }

  deleteCustomerPaymentProfile(profileId: string, paymentProfileId: string): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.deleteCustomerPaymentProfileRequestPayload(profileId, paymentProfileId), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  deleteCustomerPaymentProfileRequestPayload(profileId: string, paymentProfileId: string) {
 const jsonObject = {
      'deleteCustomerPaymentProfileRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        'customerProfileId': profileId,
        'customerPaymentProfileId': paymentProfileId
      }
    };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'DeleteCustomerPaymentProfile',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin':0,
    'Request': JSON.stringify(jsonObject)
    };
  }


  createTransactionRequest(data): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.createTransactionRequestPayload(data), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  createTransactionRequestPayload(data) {
    const jsonObject = {
      'createTransactionRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        'refId': this.getRefIdForAuthorizeNet(),
        'transactionRequest': {
          'transactionType': 'authOnlyTransaction',
          'amount': data.amount, // 22.09
          'profile': {
            'customerProfileId': this.createTransaction.customerProfileId,  // '{{vCustomerProfileId}}',
            'paymentProfile': {
              'paymentProfileId': this.createTransaction.customerPaymentProfileId, // '{{vCustomerPaymentProfileIdList}}',
              'cardCode': this.createTransaction.cvv // '353'
            }
          },
          'tax': {
            'amount': data.taxAmount, // 3.11,
            'name': data.taxType, // 'Sale Tax',
            'description': data.taxType // 'Sale Tax'
          }
        }
      }
    };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'CreateTransaction',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin':this.commonservice.issuerNumber,
    'Request': JSON.stringify(jsonObject)
    };
  }

  getRefIdForAuthorizeNet() {
    let refID = '';
    if (this.customerSession) {
      const userId = this.customerSession.UserId;
      const milliSec = Math.floor(Date.now() / 1000);
      refID = milliSec.toString() + userId;
    }
    return refID;
  }
  cardValidPaymentProfileRequest(profile: CardValidProfile): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.cardVerification(profile), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }
  cardVerification(cardProfile: CardValidProfile) {
    const jsonObject = {
      'createTransactionRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        "transactionRequest": {
          "transactionType": "authOnlyTransaction",
          "amount": cardProfile.CardValidationAmount,
          "payment": {
            "creditCard": {
              "cardNumber": cardProfile.cardNumber,
              "expirationDate": cardProfile.expirationDate,
              "cardCode": cardProfile.cardCode,
              
            }
          },
          "customer": {
            "email": this.customerInfo.EmailId,
          },
          "billTo": {
            "firstName": cardProfile.firstName,
            "lastName": cardProfile.lastName,
            "address": cardProfile.address,
            "city": cardProfile.city,
            "state": cardProfile.state,
            "zip": cardProfile.zip,
            "country": "United States",
            "phoneNumber": cardProfile.phoneNumber
          },"transactionSettings": {
          "setting": {
            "settingName": "duplicateWindow",
            "settingValue": "1"
          }
        }
        }
      }
    };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'CardValidation',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin':cardProfile.cardNumber.substring(0, 6) || 0,
    'Request': JSON.stringify(jsonObject)
    };
  }
  VoidTransactionRequest(refTransId:any): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.Authorize,
      this.VoidTransactionRequestParams(refTransId), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }
VoidTransactionRequestParams(refTransId:any) {
    const jsonObject = {
      'createTransactionRequest': {
        'merchantAuthentication': {
          'name': this.appConfig.merchantAuthentication.vAppLoginId,
          'transactionKey': this.appConfig.merchantAuthentication.vTransactionKey
        },
        'refId':'',
        "transactionRequest": {
          "transactionType": "voidTransaction",
          "refTransId":refTransId,
        }
        }
      };
    return {
      'UserId': this.customerSession.UserId,
      'StoreId': this.customerSession.StoreId,
      'AppId': this.customerSession.AppId,
      'SessionId': this.customerSession.SessionId,
      'ActionType':'VoidTransaction',
      'forterTokenCookie': this.cookieService.get('forterToken'),
      'CartId': (this.cartService.cartdetails && this.cartService.cartdetails.CartId) || 0,
      'DeviceType': 'W',
      'bin':0,
    'Request': JSON.stringify(jsonObject)
    };
  }
}



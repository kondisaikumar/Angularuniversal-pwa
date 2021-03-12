import { Injectable } from '@angular/core';
import { Observable, of, throwError, EMPTY, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { switchMap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { baseUrl, UrlNames } from './url-provider';
import { CustomerSelectors } from '../state/customer/customer.selector';
import { CustomerLoginSession } from '../models/customer-login-session';

import { CartAddItemRequestPayload } from '../models/cart-add-item-request-payload';
import { CartRemoveItemRequestPayload } from '../models/cart-remove-item-request-payload';
import { CartGetDetailsRequestPayload } from '../models/cart-get-details-request-payload';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { CreditutilizeRequestPayload } from '../models/creditutilize-request';
import { ProductStoreService } from './product-store.service';
import { CommonService } from '../shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
  customerSession: CustomerLoginSession;
  cartId = 0;
  cartdetails: any;
  cartNewDeliverySlots = new Subject<any>();
  cartItemCount = new Subject<number>();
  cartUpdated = new Subject<any>();
  userRemarks: string;
  isItemRemovedFromCart = false;
  DeliveryInstruction: string;
  selectedDeliveryTime: any;
  selectedPaymentType: string='';
  paymentProfiles = [];
 backorderdate = new Subject<any>();

  constructor(private http: HttpClient,
    private store: Store<CustomerLoginSession>, private commonService: CommonService,
    private errorHandler: ErrorHandlerService) {
    this.store.select(CustomerSelectors.customerLoginSessionData)
      .subscribe(clsd => {
        if (clsd) {
          this.customerSession = clsd;
        }
      });
      this.userRemarks = '';
  }

  addToCard(pid: number, qty: number): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.CartAddItem,
      this.getAddToCartRequestParams(pid, qty), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          if (res.CartId) {
            this.cartId = res.CartId;
            this.cartItemCount.next(res.CartItemCount);
          }
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  private getAddToCartRequestParams(pid: number, qty: number): CartAddItemRequestPayload {
    if (!this.customerSession) {
      return null;
    }

    return {
      StoreId: this.customerSession.StoreId,
      SessionId: this.customerSession.SessionId,
      UserId: this.customerSession.UserId,
      AppId: this.customerSession.AppId,
      PID: pid,
      Quantity: qty,
      CartId: this.cartId,
      DeviceId: this.customerSession.DeviceId,
      DeviceType: this.customerSession.DeviceType
    };
  }

  removeFromCart(item: any): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.CartRemoveItem,
      this.getRemoveFromCartRequestParams(item), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          this.cartItemCount.next(res.CartItemCount);
          this.isItemRemovedFromCart = true;
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  private getRemoveFromCartRequestParams(item: any): CartRemoveItemRequestPayload {
    if (!this.customerSession) {
      return null;
    }

    return {
      StoreId: this.customerSession.StoreId,
      SessionId: this.customerSession.SessionId,
      UserId: this.customerSession.UserId,
      AppId: this.customerSession.AppId,
      PID: item.PID,
      CartItemId: item.CartItemId,
      DealId: item.DealId,
      Quantity: item.Quantity,
      CartId: this.cartId,
      DeviceId: this.customerSession.DeviceId,
      DeviceType: this.customerSession.DeviceType
    };
  }

  getCartDetails(data: any): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.CartGetDetail,
      this.getCartDetailsRequestParams(data), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          this.cartdetails = res;
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  private getCartDetailsRequestParams(data): CartGetDetailsRequestPayload {
    if (!this.customerSession) {
      return null;
    }

    return {
      StoreId: this.customerSession.StoreId,
      SessionId: this.customerSession.SessionId,
      UserId: this.customerSession.UserId,
      AppId: this.customerSession.AppId,
      CartId: this.cartId,
      DeviceId: this.customerSession.DeviceId,
      DeviceType: this.customerSession.DeviceType,
      IsCredentialOff: true,
     CartDsp: 'Y',
   IsFromCheckOut: data.IsFromCheckOut,
    IsToCallDSP: data.IsToCallDSP,
   DeliveryInstruction: this.DeliveryInstruction,
  PaymentTypeId: data.PaymentTypeId,
  AddressId: data.AddressId,
   OrderTypeId: data.OrderTypeId
    };
  }

  updateCart(data: any): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.CartUpdate,
      data, { headers: this.headers }).pipe(
        switchMap((res: any) => {
          this.cartdetails = res;
          this.cartUpdated.next();
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }

  placeOrder(data: any): Observable<any> {
    if(data && data.OrderTypeId !==1 &&data.OrderTypeId !==3 ){
      Object.assign(data,{IsGift:this.commonService.isGift});
    }
    return this.http.post<any>(baseUrl + UrlNames.OrderInsert,
      data, { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }
  creditutilizeRequest(credit,cartId): Observable<any> {
    return this.http.post<any>(baseUrl + UrlNames.CreditUtilize,
      this.createCreditutilizeRequestParams(credit,cartId), { headers: this.headers }).pipe(
        switchMap((res: any) => {
          return of(res);
        }),
        catchError((error: any, caught: Observable<any>) => {
          return this.errorHandler.processError(error);
        })
      );
  }
  private createCreditutilizeRequestParams(credit: boolean, cartId: number): CreditutilizeRequestPayload {
    if (!this.customerSession) {
      return null;
    }
    return {
      StoreId: this.customerSession.StoreId,
      SessionId: this.customerSession.SessionId,
      UserId: this.customerSession.UserId,
      AppId: this.customerSession.AppId,
      IsStoreCreditUtilize: credit,
      CartId: cartId,
      DeviceId: this.customerSession.DeviceId,
      DeviceType: this.customerSession.DeviceType
    };
  }
}

import { CustomerSelectors } from "../state/customer/customer.selector";
import { ErrorHandlerService } from "../shared/services/error-handler.service";
import { CustomerLoginSession } from "../models/customer-login-session";
import { Store } from "@ngrx/store";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { UrlNames, baseUrl } from "./url-provider";
import { switchMap, catchError } from "rxjs/operators";
import { BannerGetDetailsRequestPayload } from "../models/banner-request-payload";

@Injectable({
    providedIn: 'root'
  })
  export class BannerService {
    headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    customerSession: CustomerLoginSession;
    bannerDetails=new Subject<any>();
    customerSessionStoreId=new Subject<any>();
  bannerArray =[];

    constructor(private http: HttpClient,
        private store: Store<CustomerLoginSession>,
        private errorHandler: ErrorHandlerService) {
        this.store.select(CustomerSelectors.customerLoginSessionData)
          .subscribe(clsd => {
            if (clsd) {
              this.customerSession = clsd;
              this.customerSessionStoreId.next(clsd.StoreId)
              
            }
          });
        }
        subsbannerdetails(): Observable<any>{
          return this.bannerDetails;
        }
        getBannerDetails(): Observable<any> {
            return this.http.post<any>(baseUrl + UrlNames.BannerGetDetail,
              this.getBannerDetailsRequestParams(), { headers: this.headers }).pipe(
                switchMap((res: any) => {
                  if(res !== null){
                  this.bannerDetails.next(res.ListBanner);
                  this.bannerArray = res.ListBanner;
                } else {
                  this.bannerDetails.next();
                  this.bannerArray = [];
                }
                  return of(res);
                }),
                catchError((error: any, caught: Observable<any>) => {
                  return this.errorHandler.processError(error);
                })
              );
          }
private getBannerDetailsRequestParams(): BannerGetDetailsRequestPayload {
    if (!this.customerSession) {
      return null;
    }

    return {
      StoreId: this.customerSession.StoreId,
      UserId: this.customerSession.UserId,
      SessionId: this.customerSession.SessionId,
      AppId: this.customerSession.AppId,
      CartId: 0,
      DeviceId: this.customerSession.DeviceId,
      DeviceType: this.customerSession.DeviceType,
      PID: 0
    };
  }
  bannerAndPromotionClicks(promotionid:any,type:any,Action:any): Observable<any> {
    let body: any;
    body ={
      "MarketPromotionId": promotionid,
      "Type" : type,
      "ActionType" : Action,
      "AppId" : this.customerSession.AppId,
      "StoreId": this.customerSession.StoreId,
      "UserId": this.customerSession.UserId,
      "DeviceType" : this.customerSession.DeviceType,
      "DeviceId": this.customerSession.DeviceId
      }
      return this.http.post<any>(baseUrl + UrlNames.StoreMarketPromotionViewStates,
        body, { headers: this.headers }).pipe(
          switchMap((res: any) => {
            return of(res);
          }),
          catchError((error: any, caught: Observable<any>) => {
            return this.errorHandler.processError(error);
          })
        );
    
  }
  }
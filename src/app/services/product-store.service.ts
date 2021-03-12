import { Injectable } from '@angular/core';
import { Observable, of, throwError, EMPTY, Subject } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { switchMap, catchError, debounceTime } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { baseUrl, UrlNames } from './url-provider';
import { CustomerSelectors } from '../state/customer/customer.selector';
import { CustomerLoginSession } from '../models/customer-login-session';
import { StoreGetHome } from '../state/product-store/product-store.action';
import { ProductGetListRequestPayload } from '../models/product-get-list-request-payload';
import { ProductGetDetailsRequestPayload } from '../models/product-get-details-request-payload';
import { EventGetDetailsRequestPayload } from '../models/event-get-details-request-payload';
import { FavoriteProductUpdateRequestPayload } from '../models/favorite-product-update-payload';
import { AddProductReview } from '../models/add-product-review';
import { UpdateProductReview } from '../models/update-product-review';
import { ReviewList } from '../models/review-list';
import { ErrorHandlerService } from '../shared/services/error-handler.service';
import { BaseRequest } from '../models/base-request';
import { CartService } from '../services/cart.service';
import { ElasticSearchRequestPayload } from '../models/elastic-search-request-payload';
import { CommonService } from '../shared/services/common.service';
import { TopPicksListRequestPayload } from '../models/top-picks-request-payload';
import { ToppicksComponent } from '../pages/toppicks/toppicks.component';

@Injectable()
export class ProductStoreService {
    headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    customerSession: CustomerLoginSession;
    variableSession = null;
    storeDetails: any;
    couponsList: any;
    storeList: any;
    customerInfo: any;
    isFavoritesUpdated = false;
  elaticsearchText: string;
  orderType: string;
  couponAvailable = new Subject<any>();
  couponAvailablecheckout: any;
    storeChange = new Subject<any>();
    catid: string;
    topPickspage: number;
  

    constructor(private http: HttpClient,
        private store: Store<CustomerLoginSession>, private commonService: CommonService,
        private errorHandler: ErrorHandlerService,
        private cartService: CartService) {
        this.store.select(CustomerSelectors.customerLoginSessionData)
            .subscribe(clsd => {
                if (clsd) {
                    this.customerSession = clsd;
                    if (this.customerSession.StoreId !== 0) {
                        this.store.dispatch(new StoreGetHome());
                    }
                }
            });
    }

    getStoreHome(): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.GetStoreHome, this.getStoreObject()).pipe(
            switchMap((res: any) => {
                if (res && res.CustomerInfo) {
                    this.customerInfo = res.CustomerInfo;
                    this.commonService.bannerclicks = false;
                    this.cartService.cartItemCount.next(res.CustomerInfo.CartItemCount);
                }
                // this.storeDetails = null;
                this.couponsList = null;
                this.storeList = null;
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    private getStoreObject(): any {
        if (!this.customerSession) {
            return null;
        }

        return {
            StoreId: this.customerSession.StoreId,
            SessionId: this.customerSession.SessionId,
            UserId: this.customerSession.UserId,
            AppId: this.customerSession.AppId,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType,
            IsFeatureProduct: 1
        };
    }

    getStoreDetails(): Observable<any> {

        if (this.storeDetails) {
            return of(this.storeDetails);
        }

        return this.http.post<any>(baseUrl + UrlNames.StoreGetDetail, this.getProfileDetailsRequestParams()).pipe(
            switchMap((res: any) => {
                if (res) {
                    this.storeDetails = res;
                }
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }
    getelastiSearch(): Observable<any> {
        // tslint:disable-next-line:max-line-length
        return this.http.post<any>(baseUrl + UrlNames.ElasticSearch, this.getElasticSearchRequestParams(), { headers: this.headers }).pipe(
            debounceTime(100), switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }  private getElasticSearchRequestParams(): ElasticSearchRequestPayload {
        if (!this.customerSession) {
            return null;
        }

        return {
            StoreId: this.customerSession.StoreId,
            SearchWord: this.elaticsearchText
        };
    }

    productGetList(reqParams: ProductGetListRequestPayload): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ProductGetList, reqParams, { headers: this.headers }).pipe(
            switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    getProductGetListParams({ pageSize = 12, pageNumber = this.topPickspage, isClub = 0,
        categoryId = '1,2,3,4', sizeId = '', listId ='',
        typeId = '', varietalId = '', countryId = '',
        regionId = '', isFavorite = 0, isFeatured = 0,isStaffPicks = 0,
       SortBy = 0,PriceRangeId = '', keyWord = '',ProductType=0,Review = 0,
    }:
        {
            pageSize?: number, pageNumber?: number, isClub?: number,
            categoryId?: string, sizeId?: string,listId?: string,
            typeId?: string, varietalId?: string, countryId?: string,
            regionId?: string, isFavorite?: number, isFeatured?: number,isStaffPicks?:number,
             SortBy?: number,PriceRangeId?: string,Review?: number,keyWord?: string,ProductType?: number
        } = {}) {

        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            AppId: this.customerSession.AppId,
            PageSize: pageSize,
            PageNumber: pageNumber,
            IsClub: isClub,
            CategoryId: categoryId,
            SessionId: this.customerSession.SessionId,
            UserId: this.customerSession.UserId,
            SizeId: sizeId,
            ProductType:ProductType,
            ListId: listId,
            TypeId: typeId,
            VarietalId: varietalId,
            CountryId: countryId,
            RegionId: regionId,
            IsFavorite: isFavorite,
            IsFeatureProduct: isFeatured,
            IsStaffPicks: isStaffPicks,
            KeyWord: keyWord,
            SortBy: SortBy,
            PriceRangeId:PriceRangeId,
            Review: Review,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType
        };
    }


     
    topPicksGetList(reqParams:TopPicksListRequestPayload): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.TopPicksList, reqParams, { headers: this.headers }).pipe(
            switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    getTopPicksListParams({ pageSize = 12, pageNumber = 1, isClub = 0,
        categoryId = this.catid, sizeId = '', isStock = 0,
        typeId = '', varietalId = '', countryId = '',
        regionId = '', isFavorite = 0,
       PriceRangeId = '', keyWord = ''
    }:
        {
            pageSize?: number, pageNumber?: number, isClub?: number,
            categoryId?: string, sizeId?: string,isStock?:number,
            typeId?: string, varietalId?: string, countryId?: string,
            regionId?: string, isFavorite?: number,
             PriceRangeId?: string,keyWord?: string
        } = {}) {

        if (!this.customerSession) {
            return null;
        }
        return {
           
            AppId: this.customerSession.AppId,
            CategoryId: categoryId,
            CountryId: countryId,
            IsClub: isClub,
            IsFavorite: isFavorite,
            IsStock: isStock,
            KeyWord: keyWord,
            PageSize: pageSize,
            PageNumber: pageNumber,
            PriceRangeId:PriceRangeId,
            RegionId: regionId,
            SessionId: this.customerSession.SessionId,
            SizeId: sizeId,
            StoreId: this.customerSession.StoreId,
            TypeId: typeId,
            UserId: this.customerSession.UserId,
            VarietalId: varietalId
        };
    }
    productGetDetails(reqParams: ProductGetDetailsRequestPayload): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ProductGetDetails, reqParams, { headers: this.headers }).pipe(
            switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    getProductGetDetailsParams(pid: number): ProductGetDetailsRequestPayload {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            PID: pid,
            DeviceType:"W"
        };
    }

    getReviewList(pid: number, pageNumber: number, totalcount: number): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ReviewGetList,
            this.getReviewListParams(pid, pageNumber, totalcount), { headers: this.headers }).pipe(
                switchMap((res: any) => {
                    return of(res);
                }),
                catchError((error: any, caught: Observable<any>) => {
                    return this.errorHandler.processError(error);
                })
            );
    }

    getReviewListParams(pid: number, pageNumber: number, totalcount: number): ReviewList {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType,
            PageSize: totalcount,
            PageNumber: pageNumber,
            PID: pid,
        };
    }


    eventGetDetails(reqParams: EventGetDetailsRequestPayload): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.EventGetDetails, reqParams, { headers: this.headers }).pipe(
            switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    getEventGetDetailsParams(eid: number): EventGetDetailsRequestPayload {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            EventID: eid
        };
    }

    favoriteProductUpdate(productId: number, favStatus: boolean): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.FavoriteProductUpdate, this.getFavoriteUpdateObject(productId, favStatus));
    }

    getFavoriteUpdateObject(productId: number, favStatus: boolean): FavoriteProductUpdateRequestPayload {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            PID: productId,
            FavoriteStatus: favStatus
        };
    }

    addProductReview(productId: number, reviewTitle: string, reviewDescription: string, rating: number): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ReviewRatingInsert,
            this.getProductReviewParams(productId, reviewTitle, reviewDescription, rating));
    }

    updateProductReview(
        productId: number, reviewTitle: string, reviewDescription: string, rating: number, reviewId: number): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ReviewRatingUpdate,
            this.getUpdateProductReviewParams(productId, reviewTitle, reviewDescription, rating, reviewId));
    }

    getProductReviewParams(productId: number, reviewTitle: string, reviewDescription: string, rating: number): AddProductReview {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            PID: productId,
            ReviewTitle: reviewTitle,
            ReviewDescription: reviewDescription,
            ReviewRating: rating,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType
        };
    }

    getUpdateProductReviewParams(
        productId: number, reviewTitle: string, reviewDescription: string, rating: number, reviewId: number): UpdateProductReview {
        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            UserId: this.customerSession.UserId,
            SessionId: this.customerSession.SessionId,
            AppId: this.customerSession.AppId,
            PID: productId,
            ReviewTitle: reviewTitle,
            ReviewDescription: reviewDescription,
            ReviewRating: rating,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType,
            ReviewID: reviewId
        };
    }

    couponsGetDetails(): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.CouponGetList,
            this.getProfileDetailsRequestParams(), { headers: this.headers }).pipe(
            switchMap((res: any) => {
                this.couponsList = res;
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    storeGetList(): Observable<any> {

        if (this.storeList) {
            return of(this.storeList);
        }

        return this.http.post<any>(baseUrl + UrlNames.StoreGetList,
            this.getProfileDetailsRequestParams(), { headers: this.headers }).pipe(
            switchMap((res: any) => {
                this.storeList = res;
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    private getProfileDetailsRequestParams(): BaseRequest {
        if (!this.customerSession) {
            return null;
        }

        return {
            StoreId: this.customerSession.StoreId,
            SessionId: this.customerSession.SessionId,
            UserId: this.customerSession.UserId,
            AppId: this.customerSession.AppId,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType
        };
    }





    staffPicksGetList(reqParams: ProductGetListRequestPayload): Observable<any> {
        return this.http.post<any>(baseUrl + UrlNames.ProductGetList, reqParams, { headers: this.headers }).pipe(
            switchMap((res: any) => {
                return of(res);
            }),
            catchError((error: any, caught: Observable<any>) => {
                return this.errorHandler.processError(error);
            })
        );
    }

    getStaffpicksGetListParams({ pageSize = 12, pageNumber = this.topPickspage, isClub = 0,
        categoryId = '1,2,3,4', sizeId = '', listId ='',
        typeId = '', varietalId = '', countryId = '',
        regionId = '', isFavorite = 0, isFeatured = 0,isStaffPicks = 0,
       PriceRangeId = '', keyWord = '',ProductType=0
    }:
        {
            pageSize?: number, pageNumber?: number, isClub?: number,
            categoryId?: string, sizeId?: string,listId?: string,
            typeId?: string, varietalId?: string, countryId?: string,
            regionId?: string, isFavorite?: number, isFeatured?: number,isStaffPicks?:number,
             PriceRangeId?: string,keyWord?: string,ProductType?: number
        } = {}) {

        if (!this.customerSession) {
            return null;
        }
        return {
            StoreId: this.customerSession.StoreId,
            AppId: this.customerSession.AppId,
            PageSize: pageSize,
            PageNumber: pageNumber,
            IsClub: isClub,
            CategoryId: categoryId,
            SessionId: this.customerSession.SessionId,
            UserId: this.customerSession.UserId,
            SizeId: sizeId,
            ProductType:ProductType,
            ListId: listId,
            TypeId: typeId,
            VarietalId: varietalId,
            CountryId: countryId,
            RegionId: regionId,
            IsFavorite: isFavorite,
            IsFeatureProduct: isFeatured,
            IsStaffPicks: isStaffPicks,
            KeyWord: keyWord,

            PriceRangeId:PriceRangeId,
            DeviceId: this.customerSession.DeviceId,
            DeviceType: this.customerSession.DeviceType
        };
    }

}

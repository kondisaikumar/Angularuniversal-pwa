
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  cacheUpdated = new Subject<any>();
  orderPlaced = new Subject<boolean>();
  accordionExpand: any;
 currentStoreid = new Subject<any>();
  multistoreclicked = new Subject<any>();
  storeList = new Subject<any>();
  agePopUp = new Subject<any>();
  openProfileModal = new Subject<any>();
  ageverify = new Subject<any>();
  isurlCheckout: boolean;
  getBannerStoreId=0;
  promotionsList: { AppId: number; BannerId: number; BannerTargetContent: string; BannerTargetType: string; BannerTitle: string; BannerURL: string; SortNumber: number; StoreId: number; UserId: number; ViewTime: number; }[];
  promotionlistarray = new Subject<any>();
  isCartLoading: any=false;
  eventsProductAddedToCart=false;
  bannerclicks = false;
  categoryId='';
  staffPicksTitle = new Subject<any>();
  issuerNumber: number;
  isGift: boolean= false;

  constructor(private _meta: Meta, private _title: Title, ) {}

  onCacheUpdated() {
    this.cacheUpdated.next();
  }

  onOrderPlaced(status: boolean) {
    this.orderPlaced.next(status);
  }

updateMeta(metaItem){
  this._title.setTitle(metaItem);
  this._meta.updateTag({ property: 'og:Title', content: metaItem});
  this._meta.updateTag({ name: 'description', content: metaItem});
  this._meta.updateTag({ name: 'url', content:  window.location.href });
  this._meta.updateTag({ property: 'og:description', content:metaItem });
  this._meta.updateTag({ property: 'og:url', content:  window.location.href });
  this._meta.updateTag({ property: 'twitter:title', content:metaItem });
  this._meta.updateTag({ property: 'twitter:description', content:metaItem});
  this._meta.updateTag({ itemprop: 'name', content:metaItem});
  this._meta.updateTag({ itemprop: 'description', content:metaItem});
  this._meta.updateTag({ itemprop: 'keywords', content:metaItem});

}


}

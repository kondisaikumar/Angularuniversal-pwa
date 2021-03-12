import { Component, HostListener, OnInit, OnDestroy, Inject } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { ProductFilters } from '../../../models/product-filters';
import { Item } from '../../../models/item';
import { Country } from '../../../models/country';
import { ProductType } from '../../../models/product-type';
import { Store } from '@ngrx/store';

import { ProductGetListRequestPayload } from '../../../models/product-get-list-request-payload';
import { ProductGetList } from '../../../state/product-store/product-store.action';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
// import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { CommonService } from '../../../shared/services/common.service';
import { AppConfigService } from '../../../app-config.service';
import { SessionService } from '../../../shared/services/session.service';
import { Title, Meta } from '@angular/platform-browser';
import { BannerService } from 'src/app/services/banner.service';

@Component({
  selector: 'app-advance-filter',
  templateUrl: './advance-filter.component.html',
  styleUrls: ['./advance-filter.component.scss']
})
export class AdvanceFilterComponent implements OnInit {
  allFilterOptions: ProductFilters;
  selectedFilters: Item[] = [];
  selectedTypes: ProductType[] = [];
  selectedSizes: Item[] = [];
  selectedPrices: Item[] = [];
  selectedCountries: Country[] = [];
  allRegions: Item[] = [];
  selectedRegions: Item[] = [];
  allVarietals: Item[] = [];
  selectedVarietals: Item[] = [];
  productsList: any;
  totalProducts = 0;
  PageSize = [12, 24, 36, 48, 60, 72, 84, 96];
  SortBy = ['Popularity', 'Price: Low to High', 'Price: High to Low', 'Name: A - Z', 'Name: Z - A'];
  selectedPageSize = 12;
  navigationSubscription;
  selectedReviews: Item[] = [];
  page = 1;
  fromProductNo = 1;
  routerUrl: number;
  typeIds: any;
  varietalIds: any;
  sizeIds: any;
  countryIds: any;
  regionIds: any;
  minPrices: number;
  maxPrices: number;
  selectedFiltersLength = 0;
  accordionExpand = this.commonService.accordionExpand;
  widthSide: boolean;
  crossHide: boolean;
  ads = [];
  catName:any;
  storegethomeresponse: any;
  isError: boolean=false;
  isLoading=true;
  SortProductsBy:any;
 sortbyfilter = 1;
  pricerangeid = '';
  Review = 0;
    constructor(public dataservice: DataService,
    private _title:Title,
    private _meta:Meta,
    private store: Store<ProductGetListRequestPayload>, private banerService: BannerService,
    private productStoreService: ProductStoreService, private commonService: CommonService,
    // private spinnerService: Ng4LoadingSpinnerService,
    private router: Router, private route: ActivatedRoute, private appConfig: AppConfigService,
    private progressBarService: ProgressBarService, private sessionService: SessionService) {

    /* this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.initialiseSearchFilter();
      }
    }); */
    this.store.select(ProductStoreSelectors.productStoreStateData)
    .subscribe(pssd => {
      if (pssd) {
        this.SortProductsBy = pssd.SortProductsBy.sort((x, y) => x.PriorityNo < y.PriorityNo ? -1 : 1);
        this.storegethomeresponse = pssd;
        this.dataservice.getFiltersByCategory();
        this.productsList = [];
        this.totalProducts = 0;
        this.fromProductNo = 0;
        this.initialiseSearchFilter();
        }
      });
    this.store.select(ProductStoreSelectors.productGetListData)
      .subscribe(pgld => {
        this.ads = [];
          
        if (pgld && pgld.ListBanner && pgld.ListBanner.length > 0) {
          this.ads = [];
          this.ads.push(pgld.ListBanner[0]);
          this.banerService.bannerAndPromotionClicks(pgld.ListBanner[0].BannerId,'B','V').subscribe((res)=>{
          })
        }

        const sort = pgld ? pgld.ListProduct : [];
        this.productsList = sort.sort((x, y) => x.SortNumber < y.SortNumber ? -1 : 1);
        if(this.productsList.length>0){
          this.isLoading=false;
        }
        if(this.productsList.length===0){
          this.isLoading=false;
          this.isError=true;
        }else{
          this.isError=false;
        }
        this.totalProducts = pgld ? pgld.TotalCount : 0;
        this.fromProductNo = ((this.page - 1) * this.selectedPageSize) + 1;
        // this.spinnerService.hide();
        this.progressBarService.hide();
        if(!this.router.url.includes('/product-details')){
        switch (this.routerUrl) {
          case 1:
            this.catName = "Beer";
            break;
            case 2:
              this.catName = "Liquor";
              break;
              case 3:
                this.catName = "Wine";
                break;
                case 4:
                  this.catName = "Mixers & more";
                  break; 
                  case 6:
                    this.catName = "Tobacco";
                    break;   
        }
        this.commonService.updateMeta(this.catName)   
      }
      });
  }

  ngOnInit() {
    this.isLoading=true;
    this.isError= false; 
    this.routerUrl = +this.route.snapshot.queryParams['cat'];
    this.dataservice.categoryId = +this.route.snapshot.queryParams['cat'];
    const storeid = this.route.snapshot.queryParams['storeid'];
    if (storeid !== localStorage.getItem('storeId')) {
      localStorage.setItem('storeId', storeid);
      // this.onStoreChange(storeid);
      this.commonService.currentStoreid.next(storeid);
    } else {
      if(this.storegethomeresponse !== undefined){
    this.dataservice.getFiltersByCategory();
    this.productsList = [];
    this.totalProducts = 0;
    this.fromProductNo = 0;
    this.initialiseSearchFilter();}
    }
  }

  clickbanner(params: any) {
    this.banerService.bannerAndPromotionClicks(params.BannerId,'B','C').subscribe((res)=>{
    })
    if (params.BannerTargetType === 'productsearch') {
      this.dataservice.categoryId = '1,2,3,4';
      this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: params.BannerTargetContent } });
      (<any>window).ga('eventTracking.send', 'event','ProductListBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);

    } else if (params.BannerTargetType === 'product'){
      if (params.BannerTargetContent.startsWith('#')) {
        this.dataservice.categoryId = '1,2,3,4';
        const type=params.BannerTargetContent.replace('#','hash-')
        this.router.navigate(['/advance-filter'], { queryParams: { storeid: localStorage.getItem('storeId'), keyword: type , ListId: params.ListId } });
      (<any>window).ga('eventTracking.send', 'event','ProductListBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);

      } else { 
        this.router.navigate([`/product-details/ ${params.BannerTargetContent}/${localStorage.getItem('storeId')}`]);
        localStorage.setItem('EventsProductId', params.BannerTargetContent);
        (<any>window).ga('eventTracking.send', 'event','ProductBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
        localStorage.setItem('PromotionTitle', params.BannerTitle);
    }
      } else if(params.BannerTargetType === 'weblink'){
      window.open(params.BannerTargetContent, '_blank');
      (<any>window).ga('eventTracking.send', 'event','weblinkBannerClicked',localStorage.getItem('storeId'),params.BannerTitle);
    }
    
  }
  onReviewChange(item: number, value: any){
    this.commonService.accordionExpand = value;
    if(this.Review === item){
      this.Review = 0;
    } else {
      const reviewvalue = item+' Stars & Up';
      this.selectedReviews = [{ id: '002', SortNumber: 1, value: reviewvalue, isSelected: true }];
      this.Review = item;
    }
    this.getFilteredProducts();
  }

  initialiseSearchFilter() {
    if (this.route.snapshot.queryParams['keyword']) {
      this.dataservice.searchByText = this.route.snapshot.queryParams['keyword'];
    } else {
      this.dataservice.searchByText = '';
    }
      if (this.route.snapshot.queryParams['sortby']) {
        this.sortbyfilter = +this.route.snapshot.queryParams['sortby'];
      } else {
        this.sortbyfilter = 1;
      }
    if (this.dataservice.searchByText !== '') {
      this.selectedFilters = [{ id: '001',  SortNumber: 1, value: this.dataservice.searchByText, isSelected: true }];
      this.getProductsByKeyword();
    } else if (this.dataservice.filtersAllData) {
      this.allFilterOptions = this.dataservice.filtersAllData;
    }
      if (this.route.snapshot.queryParams['typeId']) {
        this.typeIds = this.route.snapshot.queryParams['typeId'];
        let x = [];
        x = this.typeIds.split(',').map(Number);
        for (let i = 0; i < x.length; i++) {
          const objIndex = this.allFilterOptions.type.findIndex((obj => obj.id === x[i]));
          this.allFilterOptions.type[objIndex].isSelected = true;
        }
        this.allVarietals = [];
        this.allFilterOptions.type.filter(type => type.isSelected === true).forEach(item => {
          this.allVarietals = [...this.allVarietals, ...item.varietals];
        });

        if (this.allFilterOptions.type.filter(type => type.isSelected === true).length === 0) {
          this.getAllVarietals();
        }
      } else {
        this.typeIds = '';
        this.allVarietals = this.dataservice.allVarietals;
      }
      if (this.route.snapshot.queryParams['varietalId']) {
        this.varietalIds = this.route.snapshot.queryParams['varietalId'];
        let x = [];
        x = this.varietalIds.split(',').map(Number);
        for (let i = 0; i < x.length; i++) {
          const objIndex = this.allVarietals.findIndex((obj => obj.id === x[i]));
          this.allVarietals[objIndex].isSelected = true;
        }
      } else {
        this.varietalIds = '';
      }
      if (this.route.snapshot.queryParams['Review'] && this.route.snapshot.queryParams['Review'] !== '0') {
        const reviewvalue = this.route.snapshot.queryParams['Review']+' Stars & Up';
        this.selectedReviews = [{ id: '002', SortNumber: 1, value: reviewvalue, isSelected: true }];
        this.Review = +this.route.snapshot.queryParams['Review'];
      } else {
        this.Review = 0;
      }
      if (this.route.snapshot.queryParams['sizeId']) {
        this.sizeIds = this.route.snapshot.queryParams['sizeId'];
        let x = [];
        x = this.sizeIds.split(',').map(Number);
        for (let i = 0; i < x.length; i++) {
          const objIndex = this.allFilterOptions.size.findIndex((obj => obj.id === x[i]));
          this.allFilterOptions.size[objIndex].isSelected = true;
        }
      } else {
        this.sizeIds = '';
      }
      if (this.route.snapshot.queryParams['PriceRangeId']) {
        this.pricerangeid = this.route.snapshot.queryParams['PriceRangeId'];
        let x = [];
        x = this.pricerangeid.split(',').map(Number);
        for (let i = 0; i < x.length; i++) {
          const objIndex = this.allFilterOptions.price.findIndex((obj => obj.id === x[i]));
          this.allFilterOptions.price[objIndex].isSelected = true;
        }
      } else {
        this.pricerangeid = '';
      }
 


    if (this.route.snapshot.queryParams['countryId']) {
      this.countryIds = this.route.snapshot.queryParams['countryId'];
      let x = [];
      x = this.countryIds.split(',').map(Number);
      for (let i = 0; i < x.length; i++) {
        const objIndex = this.allFilterOptions.countries.findIndex((obj => obj.id === x[i]));
        this.allFilterOptions.countries[objIndex].isSelected = true;
      }
        this.allRegions=[];
      this.allFilterOptions.countries.filter(country => country.isSelected === true).forEach(item => {
        this.allRegions = [...this.allRegions, ...item.regions];
      });

        if (this.allFilterOptions.countries.filter(country => country.isSelected === true).length === 0) {
          this.getAllRegions();
        }
      } else {
        this.countryIds = '';
        if (this.allFilterOptions && this.allFilterOptions.countries) {
          this.allRegions = this.allFilterOptions.countries.reduce((acc, item) => [...acc, ...item.regions], []);
        }
      }
    if (this.route.snapshot.queryParams['regionId']) {
      this.regionIds = this.route.snapshot.queryParams['regionId'];
      let x = [];
      x = this.regionIds.split(',').map(Number);
      for (let i = 0; i < x.length; i++) {
        const objIndex = this.allRegions.findIndex((obj => obj.id === x[i]));
        this.allRegions[objIndex].isSelected = true;
      }
    } else {
      this.regionIds = '';
    }
 

    if (this.route.snapshot.queryParams['pageNumber'] && this.route.snapshot.queryParams['pageSize']) {
      this.page = +this.route.snapshot.queryParams['pageNumber'];
      this.selectedPageSize = +this.route.snapshot.queryParams['pageSize'];
    } else {
      this.page = 1;
      this.selectedPageSize = 12;
    }

    // minPrice: 0, maxPrice: 0,
    this.getAllSelectedFilters();
    // this.getFilteredProducts();
    this.store.dispatch(new ProductGetList(
      this.productStoreService.getProductGetListParams(
        {
          categoryId: this.route.snapshot.queryParams['cat'],
          pageNumber: this.page, pageSize: this.selectedPageSize, typeId: this.typeIds,
          sizeId: this.sizeIds, countryId: this.countryIds, regionId: this.regionIds, varietalId: this.varietalIds,
           SortBy: this.sortbyfilter,PriceRangeId: this.pricerangeid,keyWord: this.dataservice.searchByText
        }
      )));
    // this.allVarietals = this.dataservice.allVarietals;
    // this.getAllSelectedFilters();
    // this.getFilteredProducts();

  }
  gotoTop() {
    document.querySelector('#backtotop').scrollIntoView({ behavior: 'smooth' });
  }
  openNav() {
    this.widthSide = true;
    this.crossHide = true;
  }

  closeNav() {
    this.widthSide = false;
    this.crossHide = false;
  }
  getAllSelectedFilters() {
    this.selectedFilters = [];
    this.selectedTypes = this.getSelectedFilterOptions(this.allFilterOptions.type);
    this.selectedSizes = this.getSelectedFilterOptions(this.allFilterOptions.size);
    this.selectedPrices = this.getSelectedFilterOptions(this.allFilterOptions.price);

    this.selectedVarietals = this.getSelectedFilterOptions(this.allVarietals);

    if (this.allFilterOptions.countries.length > 0) {
      this.selectedCountries = this.getSelectedFilterOptions(this.allFilterOptions.countries);
      this.selectedRegions = this.getSelectedFilterOptions(this.allRegions);
    }

    this.selectedFilters = [...this.selectedTypes, ...this.selectedVarietals, ...this.selectedSizes, ...this.selectedPrices,
    ...this.selectedCountries, ...this.selectedRegions,...this.selectedReviews];
    this.selectedFiltersLength = this.selectedFilters.length;
  }

  onSelectionChange(item, value: any) {
    this.commonService.accordionExpand = value;
    item.isSelected = !item.isSelected;

    this.getAllSelectedFilters();
    this.getFilteredProducts();
  }

  onPageChange(pageNo) {
    this.page = pageNo;
    this.getFilteredProducts();
  }
  onCountrySelectionChange(country: Country, value: any) {
    this.commonService.accordionExpand = value;
    country.isSelected = !country.isSelected;
    this.getRegions();
    /* if (country.isSelected) {
      this.allRegions = [...this.allRegions, ...country.regions];
    } else {
      country.regions.forEach(region => {
        const rindex = this.allRegions.indexOf(region);
        if (rindex !== -1) {
          this.allRegions.splice(rindex, 1);
        }
      });
    }

    this.getAllSelectedFilters();
    this.getFilteredProducts(); */
  }
  onSortfilter(){
    this.getFilteredProducts();
  }
  onSortfilterchange(type:any,value:any){
    this.commonService.accordionExpand = value;
    this.sortbyfilter = type;
    this.getFilteredProducts();
  }
  onTypeSelectionChange(type: ProductType, value: any) {
    this.commonService.accordionExpand = value;
    type.isSelected = !type.isSelected;
    this.getVarietals();

    /* if (type.isSelected) {
     this.allVarietals = [...this.allVarietals, ...type.varietals];
   } else {
     type.varietals.forEach(varietal => {
       const rindex = this.allVarietals.indexOf(varietal);
       if (rindex !== -1) {
         this.allVarietals.splice(rindex, 1);
       }
     });
   }

   this.getAllSelectedFilters();
   this.getFilteredProducts();*/
  }

  getVarietals() {
    this.allVarietals = [];
    this.allFilterOptions.type.filter(type => type.isSelected === true).forEach(item => {
      this.allVarietals = [...this.allVarietals, ...item.varietals];
    });

    if (this.allFilterOptions.type.filter(type => type.isSelected === true).length === 0) {
      this.getAllVarietals();
    }

    this.getAllSelectedFilters();
    this.getFilteredProducts();
  }
  getAllVarietals() {
    if (this.allFilterOptions && this.allFilterOptions.type) {
      this.allVarietals = this.allFilterOptions.type.reduce((acc, item) => [...acc, ...item.varietals], []);
    }
  }

  getRegions() {
    this.allRegions = [];
    this.allFilterOptions.countries.filter(country => country.isSelected === true).forEach(item => {
      this.allRegions = [...this.allRegions, ...item.regions];
    });

    if (this.allFilterOptions.countries.filter(country => country.isSelected === true).length === 0) {
      this.getAllRegions();
    }

    this.getAllSelectedFilters();
    this.getFilteredProducts();
  }

  getAllRegions() {
    if (this.allFilterOptions && this.allFilterOptions.countries) {
      this.allRegions = this.allFilterOptions.countries.reduce((acc, item) => [...acc, ...item.regions], []);
    }
  }

  getSelectedFilterOptions(filterType): any[] {
    if (filterType) {
      return filterType.filter(type => type.isSelected === true);
    } else {
      return [];
    }
  }

  removeFilter(filter, value: any) {
    this.commonService.accordionExpand = value;
    const index = this.selectedFilters.findIndex(item => item === filter);
    if (index !== -1) {
      this.selectedFilters.splice(index, 1);

      if (filter.id === '001') {
        this.dataservice.searchByText = '';
        this.getAllSelectedFilters();
        this.getProductsByKeyword();
        return;
      }
      if(filter.id === '002'){
        this.Review = 0;
        this.selectedReviews =[];
        this.getAllSelectedFilters();
        this.getFilteredProducts();
        return;
      }
    }

    const tindex = this.allFilterOptions.type.findIndex(item => item.value === filter.value);
    if (tindex !== -1) {
      this.allFilterOptions.type[tindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
      return;
    }

    const sindex = this.allFilterOptions.size.findIndex(item => item.value === filter.value);
    if (sindex !== -1) {
      this.allFilterOptions.size[sindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
      return;
    }

    const pindex = this.allFilterOptions.price.findIndex(item => item.value === filter.value);
    if (pindex !== -1) {
      this.allFilterOptions.price[pindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
    }

    const vindex = this.allVarietals.findIndex(item => item.value === filter.value);
    if (vindex !== -1) {
      this.allVarietals[vindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
    }
    const couindex = this.allFilterOptions.countries.findIndex(item => item.value === filter.value);
    if (couindex !== -1) {
      this.allFilterOptions.countries[couindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
    }

    const regindex = this.allRegions.findIndex(item => item.value === filter.value);
    if (regindex !== -1) {
      this.allRegions[regindex].isSelected = false;
      this.getAllSelectedFilters();
      this.getFilteredProducts();
    }

  }
  onPageSizeChange() {
    this.getFilteredProducts();
  }

  /* getFeatureProducts() {
    this.spinnerService.show();
    this.store.dispatch(new ProductGetList(
      this.productStoreService.getProductGetListParams(
        {
          isFeatured: this.dataservice.isFeatureProduct, pageSize: this.selectedPageSize
        }
      )));
  } */

  getProductsByKeyword() {
    // this.spinnerService.show();
    this.progressBarService.show();
    this.store.dispatch(new ProductGetList(
      this.productStoreService.getProductGetListParams(
        {
          categoryId: this.dataservice.categoryId, pageSize: this.selectedPageSize, keyWord: this.dataservice.searchByText
        }
      )));
  }
  getFilteredProducts() {

    let types = '';
    let varietals = '';
    let sizes = '';
    let countries = '';
    let regions = '';
  let prices = ''
    if (this.selectedTypes && this.selectedTypes.length > 0) {
      types = this.selectedTypes.map((res: Item) => res.id).join(',');
    }

    if (this.selectedVarietals && this.selectedVarietals.length > 0) {
      varietals = this.selectedVarietals.map((res: Item) => res.id).join(',');
    }

    if (this.selectedSizes && this.selectedSizes.length > 0) {
      sizes = this.selectedSizes.map((res: Item) => res.id).join(',');
    }
    if (this.selectedPrices && this.selectedPrices.length > 0) {
       prices = this.selectedPrices.map((res: Item) => res.id).join(',');
    }

    if (this.selectedCountries && this.selectedCountries.length > 0) {
      countries = this.selectedCountries.map((res: Item) => res.id).join(',');
    }

    if (this.selectedRegions && this.selectedRegions.length > 0) {
      regions = this.selectedRegions.map((res: Item) => res.id).join(',');
    }
    // this.spinnerService.show();
    this.progressBarService.show();
    const obj = {
      cat: this.route.snapshot.queryParams['cat'], pageNumber: this.page, pageSize: this.selectedPageSize, typeId: types,
      sizeId: sizes, countryId: countries, regionId: regions, varietalId: varietals, PriceRangeId:prices,
       keyword: this.dataservice.searchByText, storeid: localStorage.getItem('storeId'),
      sortby: this.sortbyfilter,Review: this.Review,
    };
    for (const prop in obj) {
      if (obj[prop] === null || obj[prop] === undefined || obj[prop] === '') {
        delete obj[prop];
      }
    }
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: obj
      });
  }

  clearSearch() {
    this.allFilterOptions.type.map(type => type.isSelected = false);
    this.allFilterOptions.size.map(size => size.isSelected = false);
    this.allFilterOptions.price.map(price => price.isSelected = false);
    this.allVarietals.map(varietal => varietal.isSelected = false);
    this.getAllSelectedFilters();
    this.getFilteredProducts();
  }

  /*  ngOnDestroy() {
     if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
     }
   } */
}

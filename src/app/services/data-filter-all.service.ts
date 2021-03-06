import { ProductFilters } from '../models/product-filters';
import { Item } from '../models/item';
import { ProductStoreService } from './product-store.service';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from '../models/customer-login-session';
import { ProductStoreSelectors } from '../state/product-store/product-store.selector';
@Injectable({
    providedIn: 'root'
  })
export class DataFilterAllService {
    public categoryId = '1,2,3,4';
    public searchByText: string;
    public isFeatureProduct: number;
    public filtersAllData: ProductFilters;
    public allVarietals: Item[];
    menuOptions = [];
    constructor(private storeService: ProductStoreService,private store: Store<CustomerLoginSession>){
    this.store.select(ProductStoreSelectors.productStoreStateData)
    .subscribe(pssd => {
      if (pssd) {
        this.menuOptions = pssd;
        }
      });
    }
    public priceRanges = [
        { 'id': '1', 'name': '$0 - $10','SortNumber': 1 },
        { 'id': '2', 'name': '$10 - $25','SortNumber': 2 },
        { 'id': '3', 'name': '$25 - $50','SortNumber': 3 },
        { 'id': '4', 'name': '$50 - $100','SortNumber': 4 },
        { 'id': '5', 'name': '$100 & Above','SortNumber': 5 }
    ];

    getFiltersByCategory() {
        const allFilters = {
            size: [],
            type: [],
            price: [],
            countries: []
        };
        let filters: any;
        this.allVarietals = [];

        if (this.menuOptions && this.menuOptions['StoreFilters']) {
            filters = this.menuOptions['StoreFilters'];
            filters = filters.filter(item =>  this.categoryId.toString().indexOf(item.CategoryId) !== -1);
        } else {
            return;
        }

        if (filters && filters.length > 0) {
            const allListTypes = filters.reduce((acc, item) => [...acc, ...item.ListType], []);
            const allListSizes = filters.reduce((acc, item) => [...acc, ...item.ListSize], []);
            const allListCountries = filters.reduce((acc, item) => [...acc, ...item.ListCountries], []);
            const allListPrices = filters.reduce((acc, item) => [...acc, ...item.ListPrice], []);

            filters = {
                'ListType' : allListTypes,
                'ListSize' : allListSizes,
                'ListCountries' : allListCountries,
                'ListPrice' : allListPrices,
            };
        }

        if (!filters && !filters.ListType) {
            allFilters.type = [];
        }/*
        filters.ListType.forEach(element => {
            allFilters.type.push({ id: element.TypeId, value: element.TypeName, isSelected: false });
        });*/

        filters.ListType.forEach(type => {
            let listOfVarietals: Item[] = [];

            if (!type.ListVarietal) {
                listOfVarietals = [];
            }
            type.ListVarietal.forEach(element => {
                listOfVarietals.push({ id: element.VarietalId, SortNumber: element.SortNumber, value: element.VarietalName, isSelected: false });
            });
            allFilters.type.push({ id: type.TypeId, value: type.TypeName,SortNumber: type.SortNumber, isSelected: false, varietals: listOfVarietals });
        });

        if (allFilters && allFilters.type) {
            this.allVarietals = allFilters.type.reduce((acc, item) => [...acc, ...item.varietals], []);
        }

        if (!filters && !filters.ListSize) {
            allFilters.size = [];
        }
        filters.ListSize.forEach(element => {
            allFilters.size.push({ id: element.SizeId,SortNumber: element.SortNumber, value: element.UnitSize, isSelected: false });
        });
        if(this.categoryId === '1,2,3,4'){
const prices = filters.ListPrice.filter(item => item.CategoryId === 3);
filters.ListPrice = null;
filters.ListPrice = prices;
        }
        filters.ListPrice.forEach(element => {
            allFilters.price.push({ id: element.PriceRangeId,SortNumber: element.SortNumber, value: element.PriceRange, isSelected: false });
        });

        if (!filters && !filters.ListSize) {
            allFilters.size = [];
        }
        filters.ListCountries.forEach(country => {
            let listOfRegions: Item[] = [];

            if (!country.ListRegions) {
                listOfRegions = [];
            }
            country.ListRegions.forEach(element => {
                listOfRegions.push({ id: element.RegionId, SortNumber: element.SortNumber, value: element.RegionName, isSelected: false });
            });
            allFilters.countries.push({ id: country.CountryId, SortNumber: country.SortNumber, value: country.CountryName, isSelected: false, regions: listOfRegions });
        });
        this.filtersAllData = allFilters;
    }
}

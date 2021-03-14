import { Component, Input, Output, EventEmitter, OnChanges, Inject, PLATFORM_ID } from '@angular/core';
import { DataService } from '../../../../services/data.service';
import { ProductFilters } from '../../../../models/product-filters';
import { Router } from '@angular/router';
import { Item } from '../../../../models/item';
import { ProductType } from '../../../../models/product-type';
@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss']
})
export class FilterMenuComponent implements OnChanges {
  @Input() filters: any;
  @Output() filterApply = new EventEmitter();
  showhide = true;
  isCheckAllTypes = false;
  isCheckAllSizes = false;
  isCheckAllPrices = false;
  isCheckAllVarietals = false;

  allFilters: ProductFilters;
  priceRanges: any;
  allVarietals: any;
  myclassa = {
    'background-color': 'red',
    'color': 'white'
  };
  myclassb = {
    'background-color': 'white',
    'color': 'black'
  };
  typeid: any;
  selectedVarietalId: any;
  isVarietalSelected: any;
  isTypeSelected: any;
  
  constructor(public dataservice: DataService, private router: Router,@Inject(PLATFORM_ID) private platformId: object) {
    this.allFilters = {
      size: [],
      type: [],
      price: [],
      countries: []
    };
  }

  ngOnChanges() {
    this.dataservice.categoryId = this.filters.CategoryId;
    this.dataservice.getFiltersByCategory();
    this.allFilters = this.dataservice.filtersAllData;
    this.priceRanges = this.dataservice.priceRanges;

    this.allVarietals = [];
    this.getAllVarietals();
  }

  selectAllTypes(check: any) {
    this.allFilters.type.map(type => type.isSelected = check);
    this.applyFilter();
    this.getVarietals();
  }

  selectAllSizes(check: any) {
    this.allFilters.size.map(size => size.isSelected = check);
  }

  selectAllPrices(check: any) {
    this.allFilters.price.map(price => price.isSelected = check);
  }

  selectAllVarietals(check: any) {
    this.allVarietals.map(varietal => varietal.isSelected = check);
    this.applyFilter();
  }
  onSelected(type) {
    type.isSelected = !type.isSelected;
  }

  onTypeSelectionChange(type: ProductType) {
    this.isVarietalSelected=false
    this.isTypeSelected=true
    this.getVarietals();
    this.applyFilter();
  }

  onVarietalSelected(varietal) {
    this.isVarietalSelected=true
    this.isTypeSelected=false
    this.selectedVarietalId=varietal.id
    for (let i = 0; i < this.allVarietals.length; i++) {
      if (this.allVarietals[i].id !== varietal.id) {
        this.allVarietals[i].isSelected = false;
      }
    }
    if (!varietal.isSelected && this.isCheckAllVarietals) {
      this.isCheckAllVarietals = false;
      this.applyFilter();
    }
    this.applyFilter();
  }

  onTypeSelected(type) {
    this.typeid = type.id;
    for (let i = 0; i < this.allFilters.type.length; i++) {
      if (this.allFilters.type[i].id !== type.id) {
        this.allFilters.type[i].isSelected = false;
      }
    }
    if (!type.isSelected && this.isCheckAllTypes) {
      this.isCheckAllTypes = false;
      this.applyFilter();
    }
  }

  getVarietals() {
    this.allVarietals = [];
    this.allFilters.type.filter(type => type.isSelected === true).forEach(item => {
      this.allVarietals = [...this.allVarietals, ...item.varietals];
    });

    if (this.allFilters.type.filter(type => type.isSelected === true).length === 0) {
      this.getAllVarietals();
    }
  }
  getAllVarietals() {
    if (this.allFilters && this.allFilters.type) {
      this.allVarietals = this.allFilters.type.reduce((acc, item) => [...acc, ...item.varietals], []);
    }
  
  }
  applyFilter() {
    this.filterApply.emit();
    this.dataservice.searchByText = '';
    this.dataservice.categoryId = this.filters.CategoryId;
    this.dataservice.filtersAllData = this.allFilters;
    this.dataservice.allVarietals = this.allVarietals;

    if(!this.isVarietalSelected){
      this.selectedVarietalId=''
    }
    if(!this.isTypeSelected){
      this.typeid=''
    }

    let catName = this.filters.CategoryName;
    if (catName === 'Mixers & More') {
      catName = 'mixers-more';
    }
    const obj = {
      cat: this.dataservice.categoryId,
      typeId: this.typeid,
      varietalId: this.selectedVarietalId,
      storeid: localStorage.getItem('storeId')
    };
    for (const prop in obj) {
      if (obj[prop] === null || obj[prop] === undefined || obj[prop] === '') {
        delete obj[prop];
      }
    }
    // tslint:disable-next-line:max-line-length
    this.router.navigate([`/${catName.toLowerCase()}`], { queryParams: obj });
  }

  clearAll() {
    this.selectAllTypes(false);
    this.selectAllSizes(false);
    this.selectAllPrices(false);
    this.selectAllVarietals(false);
    this.isCheckAllTypes = false;
    this.isCheckAllSizes = false;
    this.isCheckAllPrices = false;
    this.isCheckAllVarietals = false;
    this.isVarietalSelected=false
  }
  showHideDiv(isclicked) {
    this.showhide = isclicked;
  }
}

import { Component, OnInit, EventEmitter, Output, Input, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CustomerService } from 'src/app/services/customer.service';
import { MapsAPILoader } from '@agm/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';
import { CustomerLoginSession } from 'src/app/models/customer-login-session';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-addaddress',
  templateUrl: './addaddress.component.html',
  styleUrls: ['./addaddress.component.scss']
})
export class AddaddressComponent implements OnInit {
  @ViewChild('closemodal') closemodal: ElementRef;
  @Output() close = new EventEmitter();
  @ViewChild('search') public searchElementRef: ElementRef;
  formAddNewAddress: FormGroup;
  submitted = false;
  returnUrl: string;
  street_number = '';
  address_route = '';
  locality = '';
  administrative_area_level_1 = '';
  country = '';
  postal_code = '';
  streetAddress = '';
  profile: any;
  FirstName: any;
  LastName: any;
  ContactNo: any;
  favcheckflag = false;
  storeGetHomeData: any;
  stateList: any;
  constructor(private customerService: CustomerService,
    private mapsAPILoader: MapsAPILoader,
    private store: Store<CustomerLoginSession>,
    private productService: ProductStoreService,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private formBuilder: FormBuilder) {
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          this.stateList = this.storeGetHomeData.ListState;
        }
        });
     }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'myaccount/manage-addresses';
    this.customerService.getProfileDetails().subscribe(
      (data: any) => {
        this.profile = data;

        if (this.profile && this.profile.FirstName) {
          this.FirstName = this.profile.FirstName;
        }
        if (this.profile && this.profile.LastName) {
          this.LastName = this.profile.LastName;
        }
        if (this.profile && this.profile.ContactNo) {
          this.ContactNo = this.profile.ContactNo;
        }
        // console.log(this.FirstName, this.LastName, this.ContactNo);
      });

    this.formAddNewAddress = this.formBuilder.group({
      aFirstName: [this.FirstName, [Validators.required, Validators.minLength(2)]],
      aLastName: [this.LastName, [Validators.required]],
      aAddressName: ['', []],
      aAddress1: ['', [Validators.required]],
      aAddress2: ['', []],
      aCity: ['', [Validators.required]],
      aState: ['', [Validators.required]],
      aZip: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
      aContactNo: [this.ContactNo, [Validators.required]],
      aIsDefault: [false, []],
      aIsProfileUpdate: [this.ContactNo ? false : true, []]
    });
    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: []
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          this.street_number = '';
          this.address_route = '';
          this.locality = '';
          this.administrative_area_level_1 = '';
          this.country = '';
          this.postal_code = '';
          this.streetAddress = '';
          // get the place result
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // console.log(place);
          let componentForm: any;
          componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            locality: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'long_name',
            postal_code: 'short_name'
          };

          // Get each component of the address from the place details,
          // and then fill-in the corresponding field on the form.
          for (let i = 0; i < place.address_components.length; i++) {
            const addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
              const val = place.address_components[i][componentForm[addressType]];
              // console.log(val);
              if (addressType === 'street_number') {
                this.street_number = val + ' ';
              }
              if (addressType === 'route') {
                this.address_route = val;
              }
              if (addressType === 'locality') {
                this.locality = val;
              }
              if (addressType === 'administrative_area_level_1') {
                this.administrative_area_level_1 = val;
              }
              if (addressType === 'country') {
                this.country = val;
              }
              if (addressType === 'postal_code') {
                this.postal_code = val;
              }
            }
          }
          this.streetAddress = '';
          this.streetAddress = this.street_number + '' + this.address_route;
          this.formAddNewAddress.controls['aAddress1'].setValue(this.streetAddress);
          this.formAddNewAddress.controls['aCity'].setValue(this.locality);
          this.formAddNewAddress.controls['aState'].setValue(this.administrative_area_level_1);
          this.formAddNewAddress.controls['aZip'].setValue(this.postal_code);
          // tslint:disable-next-line:max-line-length
          // console.log(this.street_number, this.address_route, this.locality, this.administrative_area_level_1, this.country, this.postal_code);
          // verify result
        });
      });
    });
    /* this.formAddNewAddress = new FormGroup({
      aFirstName: new FormControl(''),
      aLastName: new FormControl(''),
      aAddressName: new FormControl(''),
      aAddress1: new FormControl(''),
      aAddress2: new FormControl(''),
      aCity: new FormControl(''),
      aState: new FormControl(''),
      aZip: new FormControl(''),
      // aCountry: new FormControl(''),
      aIsDefault: new FormControl(false),
    }); */
  }

  // convenience getter for easy access to form fields
  get f() { return this.formAddNewAddress.controls; }
  clearFields() {
    this.formAddNewAddress = this.formBuilder.group({
      aFirstName: [this.FirstName, [Validators.required, Validators.minLength(2)]],
      aLastName: [this.LastName, [Validators.required]],
      aAddressName: ['', []],
      aAddress1: ['', [Validators.required]],
      aAddress2: ['', []],
      aCity: ['', [Validators.required]],
      aState: ['', [Validators.required]],
      aZip: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
      aContactNo: [this.ContactNo, [Validators.required]],
      aIsDefault: [false, []],
      aIsProfileUpdate: [this.ContactNo ? false : true, []]
    });
  }
  onAddressSave() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.formAddNewAddress.invalid) {
      return;
    }

    const address = {
      FirstName: '', LastName: '', AddressName: '',
      Address1: '', Address2: '', City: '', State: '', Zip: '', Country: '', IsDefault: 0, IsProfileUpdate: 0,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: '', ContactNo: ''
    };

    address.FirstName = this.formAddNewAddress.get('aFirstName').value;
    address.LastName = this.formAddNewAddress.get('aLastName').value;
    address.AddressName = this.formAddNewAddress.get('aAddressName').value;
    address.Address1 = this.formAddNewAddress.get('aAddress1').value;
    address.Address2 = this.formAddNewAddress.get('aAddress2').value;
    address.City = this.formAddNewAddress.get('aCity').value;
    address.State = this.formAddNewAddress.get('aState').value;
    address.Zip = this.formAddNewAddress.get('aZip').value;
    address.ContactNo = this.formAddNewAddress.get('aContactNo').value;

    // address.Country = this.formAddNewAddress.get('aCountry').value;
    address.IsDefault = this.formAddNewAddress.get('aIsDefault').value === true ? 1 : 0;
    address.IsProfileUpdate = this.formAddNewAddress.get('aIsProfileUpdate').value === true ? 1 : 0;

    this.customerService.AddNewAddress(address).subscribe(
      (data) => {
        this.toastr.success(data.SuccessMessage);
        this.close.emit(data);
        this.clearFields();
        this.closemodal.nativeElement.click();
      });
  }
  favcheck(){
    this.favcheckflag = this.formAddNewAddress.get('aIsDefault').value;
  }
}

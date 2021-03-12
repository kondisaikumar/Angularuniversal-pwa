import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AddressInsert } from '../../../../models/address-insert';
import { CustomerService } from '../../../../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProgressBarService } from '../../../../shared/services/progress-bar.service';
import { ElementRef, NgZone, ViewChild } from '@angular/core';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from 'src/app/models/customer-login-session';
@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {
  @ViewChild('search') public searchElementRef: ElementRef;
  editAddress: any;
  formEditAddress: FormGroup;
  formProfileEdit: FormGroup;
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
  storeGetHomeData: any;
  stateList: any;
  constructor(private route: ActivatedRoute,
    private store: Store<CustomerLoginSession>,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private customerService: CustomerService,
    private router: Router,
    private toastr: ToastrService,
    private progressBarService: ProgressBarService,
    private formBuilder: FormBuilder) {
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          this.stateList = this.storeGetHomeData.ListState;
        }
        });
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
      this.formProfileEdit = this.formBuilder.group({
        pFirstName: [this.FirstName, [Validators.required, Validators.minLength(2)]],
        pLastName: [this.LastName, [Validators.required]],
        pContactNo: [this.ContactNo, [ Validators.required]]
      });

    this.formEditAddress = this.formBuilder.group({
      aFirstName: ['', [Validators.required, Validators.minLength(2)]],
      aLastName: ['', [Validators.required]],
      aAddressName: ['', []],
      aAddress1: ['', [Validators.required]],
      aAddress2: ['', []],
      aCity: ['', [Validators.required]],
      aState: ['', [Validators.required]],
      aZip: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
      aContactNo: ['', [ Validators.required]],
      aIsDefault: [false, []],
      // aIsProfileUpdate: [false, []],
    });
  }

  ngOnInit() {
    const addressId = +this.route.snapshot.paramMap.get('id');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'myaccount/manage-addresses';

    if (this.customerService.customerAddressList && this.customerService.customerAddressList.ListAddress) {
      this.editAddress = this.customerService.customerAddressList.ListAddress.filter(item => item.AddressId === addressId)[0];
      // console.log('if', this.editAddress);
      if (this.editAddress) {
        this.initializeAddress();
      }
    } else {
      this.progressBarService.show();
      this.customerService.getCustomerAddressList().subscribe(
        data => {
          if (data) {
            const addressList = data ? (data.ListAddress ? data.ListAddress : []) : [];
            this.progressBarService.hide();
            this.editAddress = addressList.filter(item => item.AddressId === addressId)[0];
              // console.log('else', this.editAddress);
            if (this.editAddress) {
              this.initializeAddress();
            }
          }
        });
    }

    // load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      this.formEditAddress.controls['aAddress1'].setValue(this.editAddress.Address1);
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
          this.formEditAddress.controls['aAddress1'].setValue(this.streetAddress);
          this.formEditAddress.controls['aCity'].setValue(this.locality);
          this.formEditAddress.controls['aState'].setValue(this.administrative_area_level_1);
          this.formEditAddress.controls['aZip'].setValue(this.postal_code);
          });
          // tslint:disable-next-line:max-line-length
          // console.log(this.street_number, this.address_route, this.locality, this.administrative_area_level_1, this.country, this.postal_code);
          // verify result
        });
      });
  }

  initializeAddress() {

    this.formEditAddress = this.formBuilder.group({
      aFirstName: [this.editAddress.FirstName, [Validators.required, Validators.minLength(2)]],
      aLastName: [this.editAddress.LastName, [Validators.required]],
      aAddressName: [this.editAddress.AddressName, []],
      aAddress1: [this.editAddress.Address1, [Validators.required]],
      aAddress2: [this.editAddress.Address2, []],
      aCity: [this.editAddress.City, [Validators.required]],
      aState: [this.editAddress.State, [Validators.required]],
      aZip: [this.editAddress.Zip, [Validators.required, Validators.minLength(5), Validators.maxLength(6)]],
      aContactNo: [this.editAddress.ContactNo, [Validators.required]],
      aIsDefault: [this.editAddress.IsDefault, []],
      // aIsProfileUpdate: [false, []],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.formEditAddress.controls; }
  get p() { return this.formProfileEdit.controls; }

  onAddressUpdate() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.formEditAddress.invalid) {
      return;
    }
    if (this.formProfileEdit.invalid) {
      return;
    }
    const profile = {
      FirstName: '', LastName: '', EmailId: this.profile.EmailId,
      ContactNo: '', DOB: this.profile.DOB, Gender: this.profile.Gender, UserIpAddress: '', ProfileImage: this.profile.profileImage,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: ''
    };

    profile.FirstName = this.formProfileEdit.get('pFirstName').value;
    profile.LastName = this.formProfileEdit.get('pLastName').value;
    profile.ContactNo = this.formProfileEdit.get('pContactNo').value;

    this.customerService.updateCustomerProfile(profile).subscribe(
      (res) => {
        if (res) {
          this.toastr.success(res.SuccessMessage);
        }
        this.progressBarService.hide();
      },
        error => {
          this.toastr.error(error);
          this.progressBarService.hide();
        });

    const address = {
      AddressId: this.editAddress.AddressId, FirstName: '', LastName: '', AddressName: '',
      Address1: '', Address2: '', City: '', State: '', Zip: '', Country: '', ContactNo: '', IsDefault: 0, IsProfileUpdate: 0,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: ''
    };

    address.FirstName = this.formEditAddress.get('aFirstName').value;
    address.LastName = this.formEditAddress.get('aLastName').value;
    address.AddressName = this.formEditAddress.get('aAddressName').value;
    address.Address1 = this.formEditAddress.get('aAddress1').value;
    address.Address2 = this.formEditAddress.get('aAddress2').value;
    address.City = this.formEditAddress.get('aCity').value;
    address.State = this.formEditAddress.get('aState').value;
    address.Zip = this.formEditAddress.get('aZip').value;
    address.ContactNo = this.formEditAddress.get('aContactNo').value;
    // address.Country = this.formAddNewAddress.get('aCountry').value;
    address.IsDefault = this.formEditAddress.get('aIsDefault').value === true ? 1 : 0;
    // address.IsProfileUpdate = this.formEditAddress.get('aIsProfileUpdate').value === true ? 1 : 0;
   
    this.customerService.UpdateAddress(address).subscribe(
      (data) => {
        this.toastr.success(data.SuccessMessage);
        // this.router.navigate(['myaccount/manage-addresses']);
        this.router.navigate([this.returnUrl]);
      });
  }

}

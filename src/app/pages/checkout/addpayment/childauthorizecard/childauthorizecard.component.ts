import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentProfile } from 'src/app/models/payment-profile';
import { CardValidProfile } from 'src/app/models/cardValidProfile';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from 'src/app/models/customer-login-session';
import { MapsAPILoader } from '@agm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment.service';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { CustomerService } from 'src/app/services/customer.service';
import { ToastrService } from 'ngx-toastr';
import { CreditcardTypeService } from 'src/app/shared/services/creditcard-type.service';
import { ProgressBarService } from 'src/app/shared/services/progress-bar.service';
import { AppConfigService } from 'src/app/app-config.service';
import { ProductStoreSelectors } from 'src/app/state/product-store/product-store.selector';

@Component({
  selector: 'app-childauthorizecard',
  templateUrl: './childauthorizecard.component.html',
  styleUrls: ['./childauthorizecard.component.scss']
})
export class ChildauthorizecardComponent implements OnInit {
  @Output() closemodalpay = new EventEmitter();
  @ViewChild('search') public searchElementRef: ElementRef;
  formAddNewPayment: FormGroup;
  submitted = false;
  customerInfo: any;
  cardType = '';
  cardProfile: PaymentProfile;
  CardValidProfile: CardValidProfile;
  isSaveAddress: boolean;
  addressList: any;
  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: any;
  isValidCard = false;
  returnUrl: string;
  street_number = '';
  address_route = '';
  locality = '';
  administrative_area_level_1 = '';
  country = '';
  postal_code = '';
  streetAddress = '';
  profile: any;
  FirstName = '';
  LastName = '';
  ContactNo = '';
  storeGetHomeData: any;
  stateList: any;
  constructor(private formBuilder: FormBuilder,
    private store: Store<CustomerLoginSession>,
    // private spinnerService: Ng4LoadingSpinnerService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private productService: ProductStoreService,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private router: Router,
    private cardService: CreditcardTypeService,
    private progressBarService: ProgressBarService,
    private appConfig: AppConfigService) {
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
          this.stateList = this.storeGetHomeData.ListState;
        }
        });
    if (this.productService.customerInfo) {
      this.customerInfo = this.productService.customerInfo;
    }
    this.customerService.getProfileDetails().subscribe(
      (data: any) => {
        this.profile = data;
        // console.log(this.profile);
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


    this.years = [];
    const year = new Date().getFullYear();

    for (let i = 0; i < 20; i++) {
      this.years.push(year + i);
    }

  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/myaccount/payment-methods';
    this.isSaveAddress = false;
    this.formAddNewPayment = this.formBuilder.group({
      firstName: [this.customerInfo && this.customerInfo.FirstName || this.FirstName, [Validators.required]],
      lastName: [this.customerInfo && this.customerInfo.LastName || this.LastName, [Validators.required]],
      sixteenDigitNumber: ['', [Validators.required, Validators.maxLength(16), Validators.minLength(15)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cardCode: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      // country: ['', [Validators.required]],
      phoneNumber: [this.customerInfo && this.customerInfo.ContactNo || this.ContactNo, [Validators.required]]
    });
    this.getAddressList();
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
          this.streetAddress = this.street_number + '' + this.address_route;
          this.formAddNewPayment.controls['address'].setValue(this.streetAddress);
          this.formAddNewPayment.controls['city'].setValue(this.locality);
          this.formAddNewPayment.controls['state'].setValue(this.administrative_area_level_1);
          this.formAddNewPayment.controls['zipCode'].setValue(this.postal_code);
          // tslint:disable-next-line:max-line-length
          // console.log(this.street_number, this.address_route, this.locality, this.administrative_area_level_1, this.country, this.postal_code);
          // verify result
        });
      });
    });
  }

  getAddressList() {
    if (this.customerService.customerAddressList && this.customerService.customerAddressList.ListAddress) {
      this.addressList = this.customerService.customerAddressList.ListAddress;
      this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1);

      if (this.addressList && this.addressList.length > 0) {
        this.initializeAddress(this.addressList[0]);
      }

    } else {
      // this.spinnerService.show();
      this.progressBarService.show();
      this.customerService.getCustomerAddressList().subscribe(
        data => {
          this.addressList = data ? (data.ListAddress ? data.ListAddress : []) : [];
          this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1);
          // this.spinnerService.hide();
          this.progressBarService.hide();

          if (this.addressList && this.addressList.length > 0) {
            this.initializeAddress(this.addressList[0]);
          }
        });
    }
  }

  initializeAddress(address) {

    this.formAddNewPayment = this.formBuilder.group({
      firstName: [this.customerInfo && this.customerInfo.FirstName || this.FirstName, [Validators.required]],
      lastName: [this.customerInfo && this.customerInfo.LastName || this.LastName, [Validators.required]],
      sixteenDigitNumber: ['', [Validators.required, Validators.maxLength(16), Validators.minLength(15)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cardCode: ['', [Validators.required]],
      address: [address.Address1, [Validators.required]],
      city: [address.City, [Validators.required]],
      state: [address.State, [Validators.required]],
      zipCode: [address.Zip, [Validators.required]],
      // country: ['', [Validators.required]],
      phoneNumber: [this.customerInfo && this.customerInfo.ContactNo || this.ContactNo, [Validators.required]]
    });

  }
clearFields() {
  this.formAddNewPayment.get('sixteenDigitNumber').reset();
  this.formAddNewPayment.get('expiryMonth').reset();
  this.formAddNewPayment.get('expiryYear').reset();
  this.formAddNewPayment.get('cardCode').reset();

}
  showCardType(isValid) {
    this.cardType = '';
    const cardNumber = this.formAddNewPayment.get('sixteenDigitNumber').value;

    if (isValid && cardNumber) {

      this.cardType = this.cardService.getCardType(this.formAddNewPayment.get('sixteenDigitNumber').value);

      /* if (this.cardType !== undefined) {
        this.isValidCard = this.isValidateCardNumber(cardNumber);

        if (!this.isValidCard) {
          this.toastr.error('Please Enter Valid Card Number');
        }
      }*/
    }
  }

  isValidateCardNumber(cardNumber): boolean {
    let cardDigits = cardNumber.split('').map(Number);
    const nonDigits = cardDigits.filter(item => isNaN(item));

    if (nonDigits.length > 0) {
      return false;
    }

    const lastDigit = cardDigits.pop();
    cardDigits.reverse();

    for (let i = 1; i <= cardDigits.length; i++) {
      if (i % 2 !== 0) {
        cardDigits[i - 1] = cardDigits[i - 1] * 2;
      }
    }

    /* cardDigits = cardDigits.map((num) => {
      if (num % 2 !== 0) {
        return num * 2;
      }
      return num;
    }); */

    cardDigits = cardDigits.map((num) => {
      if (num > 9) {
        return num - 9;
      }
      return num;
    });

    const sum = cardDigits.reduce((a, b) => a + b, 0);

    if (sum % 10 === lastDigit) {
      return true;
    }

    return false;
  }

  numericOnly(event): boolean {
    const patt = /^([0-9])$/;
    const result = patt.test(event.key);
    return result;
  }

  get f() { return this.formAddNewPayment.controls; }

  onSaveCard() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.formAddNewPayment.invalid) {
      // this.toastr.error('Please enter valid data');
      return;
    }

    /* if (!this.isValidCard) {
      this.toastr.error('Please Enter Valid Card Number');
      return;
    } */

    // this.spinnerService.show();
    this.cardProfile = new PaymentProfile();

    this.cardProfile.firstName = this.formAddNewPayment.get('firstName').value;
    this.cardProfile.lastName = this.formAddNewPayment.get('lastName').value;
    this.cardProfile.customerType = 'individual';
    this.cardProfile.address = this.formAddNewPayment.get('address').value;
    this.cardProfile.city = this.formAddNewPayment.get('city').value;
    this.cardProfile.state = this.formAddNewPayment.get('state').value;
    this.cardProfile.zip = this.formAddNewPayment.get('zipCode').value;
    // this.cardProfile.country = this.formAddNewPayment.get('country').value;
    this.cardProfile.phoneNumber = this.formAddNewPayment.get('phoneNumber').value;

    this.cardProfile.cardNumber = this.formAddNewPayment.get('sixteenDigitNumber').value;
    this.cardProfile.expirationDate =
      `${this.formAddNewPayment.get('expiryYear').value}-${this.formAddNewPayment.get('expiryMonth').value}`;
    this.cardProfile.cardCode = this.formAddNewPayment.get('cardCode').value;
    this.cardProfile.defaultPaymentProfile = false;
    this.cardProfile.validationMode = this.appConfig.validationMode;

    if (this.isSaveAddress) {
      this.saveAddress();
    }

    const paymentMethodList = this.customerService.customerPaymentMethodGetList;

    if (paymentMethodList && paymentMethodList.ListPaymentItem
      && paymentMethodList.ListPaymentItem.length > 0
      && paymentMethodList.ListPaymentItem[0].UserProfileId) {
      this.cardProfile.customerProfileId = paymentMethodList.ListPaymentItem[0].UserProfileId;
   }
    if (
      paymentMethodList &&
      paymentMethodList.ListPaymentItem &&
      paymentMethodList.ListPaymentItem.length > 0
    ) {
      this.CardValidProfile = new CardValidProfile();
      this.CardValidProfile.customerProfileId = this.cardProfile.customerProfileId;
      this.CardValidProfile.customerType = this.cardProfile.firstName;
      this.CardValidProfile.firstName = this.cardProfile.firstName;
      this.CardValidProfile.lastName = this.cardProfile.lastName;
      this.CardValidProfile.address = this.cardProfile.address;
      this.CardValidProfile.city = this.cardProfile.city;
      this.CardValidProfile.state = this.cardProfile.state;
      this.CardValidProfile.zip = this.cardProfile.zip;
      this.CardValidProfile.phoneNumber = this.cardProfile.phoneNumber;
      this.CardValidProfile.cardNumber = this.cardProfile.cardNumber;
      this.CardValidProfile.expirationDate = this.cardProfile.expirationDate;
      this.CardValidProfile.defaultPaymentProfile = this.cardProfile.defaultPaymentProfile;
      this.CardValidProfile.validationMode = this.cardProfile.validationMode;
      this.CardValidProfile.CardValidationAmount =
        paymentMethodList.ListPaymentItem[0].CardValidationAmount;
        this.CardValidProfile.cardCode= this.cardProfile.cardCode;
    }
    this.paymentService.cardValidPaymentProfileRequest(this.CardValidProfile).subscribe(data => {
      if (data && data.AuthResponse) {
        const cardApproveData = JSON.parse(data.AuthResponse);
        if(cardApproveData.transactionResponse && cardApproveData.transactionResponse.responseCode === '1' && paymentMethodList.ListPaymentItem[0].CardValidationAmount !== 0){
          this.paymentService.VoidTransactionRequest(cardApproveData.transactionResponse.transId).subscribe((data:any)=>{
            const dataRes= data;
          });
        }
        if(cardApproveData.transactionResponse && cardApproveData.transactionResponse.responseCode === '1' && cardApproveData.transactionResponse.avsResultCode === 'Y', cardApproveData.transactionResponse.cvvResultCode === 'M'){
          this.aftercardValidation();
        } else {
      this.toastr.error("The provided card details are incorrect");
    }
      }
    });

   
  }

  saveFlag() {
    this.isSaveAddress = !this.isSaveAddress;
  }
aftercardValidation(){
  this.progressBarService.show();
  if (this.cardProfile.customerProfileId) {
    this.paymentService.createCustomerPaymentProfileRequest(this.cardProfile).subscribe(data => {
      if (data && data.AuthResponse) {
        const existingCards = data.AuthResponse;
        const cardData = JSON.parse(existingCards);
        if (cardData.customerProfileId) {
          if (cardData.messages.resultCode === 'Error') {
           if (cardData.messages.message[0].text === 'A duplicate customer payment profile already exists.') {
            this.toastr.error('This card Already Exist.');
            this.progressBarService.hide();
           } else {
            this.toastr.error(cardData.messages.message[0].text);
            this.progressBarService.hide();
           }
          } else {
            this.toastr.success('Card Added Successfully');
            this.progressBarService.hide();
             this.clearFields();
            this.closemodalpay.emit();
            
          }
        } else {
          if (cardData && cardData.messages && cardData.messages.message &&
            cardData.messages.message.length > 0 && cardData.messages.message[0].text) {
              if(cardData.messages.message[0].text === 'The merchant does not accept this type of credit card.'){
                this.toastr.error('The merchant does not accept this type of credit card.');
                this.progressBarService.hide();
              } else if (cardData.messages.message[0].text === "The transaction has been declined because of an AVS mismatch. The address provided does not match billing address of cardholder.") {
                this.toastr.error(cardData.messages.message[0].text);
                this.progressBarService.hide();
              } else{
            this.paymentService.createCustomerProfile(this.cardProfile).subscribe(recoveryres => {
              if (recoveryres && recoveryres.AuthResponse) {
                const existingCardsrecovery = recoveryres.AuthResponse;
                const cardDatarecovery = JSON.parse(existingCardsrecovery);
                this.customerService.customerPaymentInsert(cardDatarecovery.customerProfileId, true, 1).subscribe(res => {
                  if (res) {
                    this.clearFields();
                    this.closemodalpay.emit();
                  }
                });

              }
            });
          }
            this.progressBarService.hide();
          }
        }
        //  }
        // });
      }
    });
  } else {
    this.paymentService.createCustomerProfile(this.cardProfile).subscribe(data => {
      if (data && data.AuthResponse) {
        const existingCards = data.AuthResponse;
        const cardData = JSON.parse(existingCards);
        if (cardData.customerProfileId) {
          this.customerService.customerPaymentInsert(cardData.customerProfileId, true, 1).subscribe(res => {
            if (res && res.SuccessMessage !== '') {
              this.toastr.success(res.SuccessMessage);
              this.progressBarService.hide();
              this.clearFields();
              this.closemodalpay.emit();
            }
          });
        } else {
          if (data && data.AuthResponse) {
          const existingCardsfailure = data.AuthResponse;
          const cardDatafailure = JSON.parse(existingCardsfailure);
          if (cardDatafailure && cardDatafailure.messages && cardDatafailure.messages.message &&
            cardDatafailure.messages.message.length > 0 && cardDatafailure.messages.message[0].text) {
              const str = cardDatafailure.messages.message[0].text;
              const error = str.match(/\d/g);
              if(error !== null && error !== undefined){
                this.toastr.error('Something went wrong. Please be patient we are recovering your previously saved cards if any.');
                const final = error.join('');
                this.customerService.customerPaymentInsert(final, true, 1).subscribe(res => {
                  if (res && res.SuccessMessage !== '') {
                    this.toastr.success(res.SuccessMessage);
                    this.progressBarService.hide();
                    this.clearFields();
                    this.closemodalpay.emit();
                  }
                });
              this.progressBarService.hide();
              } else {
                this.toastr.error(cardDatafailure.messages.message[0].text);
                this.progressBarService.hide();
                this.closemodalpay.emit();
              }
            
          }
        }
        }
    }
    });
  }
}
  saveAddress() {
    const address = {
      FirstName: '', LastName: '', AddressName: '',
      Address1: '', Address2: '', City: '', State: '', Zip: '', Country: '', IsDefault: 0, IsProfileUpdate: 0,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: '', ContactNo: ''
    };

    address.FirstName = this.cardProfile.firstName;
    address.LastName = this.cardProfile.lastName;
    address.Address1 = this.cardProfile.address;
    address.City = this.cardProfile.city;
    address.State = this.cardProfile.state;
    address.Zip = this.cardProfile.zip;
    address.ContactNo = this.cardProfile.phoneNumber;
    address.IsDefault = 0;
    address.IsProfileUpdate = 0;
    this.progressBarService.show();
    this.customerService.AddNewAddress(address).subscribe(
      (data) => {
        this.toastr.success(data.SuccessMessage);
        this.progressBarService.hide();
      });
  }
}
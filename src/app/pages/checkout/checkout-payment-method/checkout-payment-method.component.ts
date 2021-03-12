import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
//  
import { PaymentService } from '../../../services/payment.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../services/cart.service';
import { ProductStoreService } from '../../../services/product-store.service';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { Router } from '@angular/router';
import { VantivPaymentServerSideApiService } from '../../../services/vantiv-payment-serverside-api.service';
import { Store } from '@ngrx/store';
import { CustomerLoginSession } from '../../../models/customer-login-session';
import { ProductStoreSelectors } from '../../../state/product-store/product-store.selector';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-checkout-payment-method',
  templateUrl: './checkout-payment-method.component.html',
  styleUrls: ['./checkout-payment-method.component.scss']
})
export class CheckoutPaymentMethodComponent implements OnInit {

  paymentMethodList: any;
  paymentProfiles: any;
  paymentProfilesForVantiv: any;
  userProfileId: string;
  selectedCard: number;
  cardCVV: number;
  storeDetails: any;
  orderTypeId: number;
  paymentTypeId: number;
  onlinePaymentTypeId: number;
  remarks: string;
  selectedPaymentMedthod: any;
  storeGetHomeData: any;

  constructor(private store: Store<CustomerLoginSession>,
    private customerService: CustomerService,private commonService: CommonService,
    private paymentService: PaymentService,
    //  
    private toastr: ToastrService,
    private cartService: CartService,
    private storeService: ProductStoreService,
    private progressBarService: ProgressBarService,
    private route: Router,
    private vantivPaymentService: VantivPaymentServerSideApiService) {
      this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
        }
      });
    }

  ngOnInit() {
    this.getPaymentMethodGetList();
    this.getStoreDetails();
    this.orderTypeId = this.cartService.cartdetails.OrderTypeId;
    this.cartService.paymentProfiles =[];
  }
  onPopupClose() {
    this.getPaymentMethodGetList();
  }
  getStoreDetails() {
    this.storeService.getStoreDetails().subscribe(data => {
      if (data && data.GetStoredetails) {
        this.storeDetails = data.GetStoredetails;
      }
    });
  }
  getPaymentMethodGetList() {
    if (this.customerService.customerPaymentMethodGetList && this.customerService.customerPaymentMethodGetList.ListPaymentItem) {
      this.paymentMethodList = this.customerService.customerPaymentMethodGetList.ListPaymentItem;
      this.getPaymentList();
    } else {
      
      this.progressBarService.show();
      this.customerService.getCustomerPaymentMethodGetList().subscribe(
        data => {
          this.paymentMethodList = data ? (data.ListPaymentItem ? data.ListPaymentItem : []) : [];
          this.getPaymentList();
        });
    }
  }

  getPaymentList() {

    const authorizeNet = this.paymentMethodList.filter(
      type => (type.PaymentType === 'Card Payment' || type.PaymentTypeId === 1))[0];

    if (authorizeNet) {
      this.onlinePaymentTypeId = 1;
      if (authorizeNet.UserProfileId) {
        this.userProfileId = authorizeNet.UserProfileId;
        this.paymentService.createTransaction.customerProfileId = authorizeNet.UserProfileId;
        this.getExistingCardDetails(authorizeNet.UserProfileId);
      }
    }

    const vantiv = this.paymentMethodList.filter(
      type => (type.PaymentType === 'Vantiv' || type.PaymentTypeId === 7))[0];

    if (vantiv) {
      this.onlinePaymentTypeId = 7;
      // this.userProfileId = vantiv.UserProfileId;
      // this.paymentService.createTransaction.customerProfileId = vantiv.UserProfileId;
      // if (vantiv.UserProfileId) {
      this.getExistingCardDetailsForVantiv();
      // }
    } else {
      
      this.progressBarService.hide();
    }

    if (this.paymentMethodList.length === 1 && this.onlinePaymentTypeId) {
      this.cartService.cartdetails.PaymentTypeId = this.onlinePaymentTypeId;
      this.paymentTypeId = this.onlinePaymentTypeId;
    }
    if (this.paymentMethodList.length === 1 && this.cartService.cartdetails.PaymentTypeId === 2) {
      this.onlinePaymentTypeId = 2;
      this.cartService.cartdetails.PaymentTypeId = this.onlinePaymentTypeId;
      this.paymentTypeId = this.onlinePaymentTypeId;
    }
    if (this.cartService.cartdetails.PaymentTypeId === 2 && this.onlinePaymentTypeId) {
      this.cartService.cartdetails.PaymentTypeId = this.onlinePaymentTypeId;
      this.paymentTypeId = this.onlinePaymentTypeId;
    } else {
      this.paymentTypeId = this.cartService.cartdetails.PaymentTypeId;
    }
  }

  changePaymentType(paymentType) {
    this.cartService.selectedPaymentType=paymentType
        if (paymentType === 'payOnline') {
      this.cartService.cartdetails.PaymentTypeId = this.onlinePaymentTypeId;
      this.paymentTypeId = this.onlinePaymentTypeId;
    } else if (paymentType === 'payAtStore') {
      this.cartService.cartdetails.PaymentTypeId = 2;
      this.paymentTypeId = 2;
    }
  }

  getExistingCardDetails(userProfileId: string) {
    // vAppLoginId: 5Pj5hE6a   vTransactionKey: 77Za8R4Wnx988xQs
    this.paymentProfiles = [];
    if (userProfileId !== '') {
      this.progressBarService.show();
      this.paymentService.getExistingCards(userProfileId).subscribe(
        data => {
          if (data && data.AuthResponse) {
            const existingCards = data.AuthResponse;
            const cardData = JSON.parse(existingCards);
            if (cardData.profile && cardData.profile.paymentProfiles && cardData.profile.paymentProfiles.length === 1) {
              this.paymentProfiles = cardData.profile.paymentProfiles;
              this.cartService.paymentProfiles = this.paymentProfiles
              this.selectedCard = 0;
              this.updateSelectedPayment(cardData.profile.paymentProfiles[0]);
            } else if(cardData.messages.resultCode === 'Error'){
              this.paymentProfiles = [];
            } else if(cardData.profile && cardData.profile.paymentProfiles === undefined) {
              this.paymentProfiles = [];
            } else{
              this.paymentProfiles = cardData.profile.paymentProfiles;
              this.cartService.paymentProfiles = this.paymentProfiles
            }
          }
          
          this.progressBarService.hide();
        });
    } else {
      
      this.progressBarService.hide();
    }
  }

  getExistingCardDetailsForVantiv() {
    // vAppLoginId: 5Pj5hE6a   vTransactionKey: 77Za8R4Wnx988xQs
    this.paymentProfilesForVantiv = [];

    this.progressBarService.show();
      this.vantivPaymentService.getAddedCards().subscribe(
        data => {
          // data.PaymentAccountQueryResponse.Response.QueryData.Items.Item.TruncatedCardNumber
          if (data && data.VantivCardList) {
            // this.paymentProfilesForVantiv = data.PaymentAccountQueryResponse.Response.QueryData.Items.Item;
            this.paymentProfilesForVantiv = [...this.paymentProfilesForVantiv,
              ...data.VantivCardList];
              this.cartService.paymentProfiles = this.paymentProfilesForVantiv;
              if (this.paymentProfilesForVantiv.length === 1) {
                this.selectedCard = 0;
                this.updateSelectedPaymentForVantiv(this.paymentProfilesForVantiv[0]);
              }
          }
          
          this.progressBarService.hide();
        },
        error => {
          this.progressBarService.hide();
        });

  }


  saveCVV() {
    this.paymentService.createTransaction.cvv = this.cardCVV;
  }

  updateSelectedPayment(paymentProfile) {
    this.cartService.cartdetails.PaymentTypeId = 1; // paymentProfile.customerPaymentProfileId;
this.commonService.issuerNumber =paymentProfile.payment.creditCard.issuerNumber;
    this.paymentService.createTransaction.customerPaymentProfileId = paymentProfile.customerPaymentProfileId;

  }

  updateSelectedPaymentForVantiv(paymentProfile) {
    this.cartService.cartdetails.PaymentTypeId = 7; // paymentProfile.customerPaymentProfileId;

    this.vantivPaymentService.vUserSelectedPaymentAccountID = paymentProfile.PaymentAccountID;
  }

  onAddNewPaymentMethod() {
    // [routerLink]="['/myaccount/add-new-payment-method']"
    if ( this.paymentTypeId === 1) {
      this.route.navigate(['/myaccount/add-new-payment-method'], { queryParams: { returnUrl: this.route.url } });
    } else {
      this.route.navigate(['/myaccount/add-new-card'], { queryParams: { returnUrl: this.route.url } });
    }
  }

  saveRemarks() {
    this.remarks = this.remarks.replace(/[^\w\s]/gi, '');
    this.cartService.DeliveryInstruction = this.remarks;
    this.cartService.userRemarks = this.remarks;
  }

}

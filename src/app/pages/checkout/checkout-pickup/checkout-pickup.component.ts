import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { ProductStoreService } from '../../../services/product-store.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProgressBarService } from 'src/app/shared/services/progress-bar.service';
import { CustomerService } from 'src/app/services/customer.service';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-checkout-pickup',
  templateUrl: './checkout-pickup.component.html',
  styleUrls: ['./checkout-pickup.component.scss']
})
export class CheckoutPickupComponent implements OnInit {
  @ViewChild('profileModal') profileModal: ElementRef<HTMLElement>;
  @ViewChild('closeprofileModal') closeprofileModal: ElementRef<HTMLElement>;

  
  storeDetails: any;
  formProfile:FormGroup;
  submitted = false;
  FirstName: any;
  LastName: any;
  ContactNo: any;
  profile: any;
  deliveryDatesList: any;
  deliveryTimingsList: any;
  selectedDeliveryDate: any;
  selectedDeliveryTime: any;
  cartDetails=this.cartService.cartdetails;
  utcitem: any;
  checkpaymentTypeID: any;
 
  constructor(private store: Store<any>,
    private formBuilder: FormBuilder,
    private commonService:CommonService,
    private progressBarService: ProgressBarService,
    private customerService: CustomerService,
    private toastr: ToastrService,
    private cartService: CartService,
    private storeService: ProductStoreService) {
      this.storeService.getStoreDetails().subscribe(data => {
        if (data && data.GetStoredetails) {
          this.storeDetails = data.GetStoredetails;
        }
      });
      this.customerService.getProfileDetails().subscribe(
        (data: any) => {
          this.profile = data;
      });
      this.commonService.openProfileModal.subscribe(res=>
        {if(res){this.profileModal.nativeElement.click()}});
        this.cartService.backorderdate.subscribe(res=>{
          this.selectedDeliveryDate = '';
          this.selectedDeliveryTime = '';
        })

  }

  ngOnInit() {
    this.formProfile = this.formBuilder.group({
      pFirstName: ['', [Validators.required, Validators.minLength(2)]],
      pLastName: ['', [Validators.required]],
      pContactNo: ['', [Validators.required]]
    });
    this.getDeliveryDates();
  }
  get p() { return this.formProfile.controls; }
  getDeliveryDates() {
    this.deliveryDatesList = [];
    if (this.cartDetails && this.cartDetails.ListDoPTimeSlot) {
      this.cartDetails.ListDoPTimeSlot.forEach(slot => {
        if (this.deliveryDatesList.indexOf(slot.DoPDate) === -1) {
          this.deliveryDatesList.push(slot.DoPDate);
        }
      });

      // if (this.cartDetails.DoPDate !== '') {
      //   this.cartDetails.DoPDate = new Date(this.cartDetails.DoPDate).toLocaleDateString();
      // }
      if (this.deliveryDatesList.indexOf(this.cartDetails.DoPDate) >= 0) {
        this.selectedDeliveryDate = this.cartDetails.DoPDate;
      } else {
         this.selectedDeliveryDate = '';
      }
      this.getDeliveryTimings(false);
    }
  }
 
  getDeliveryTimings(isClicked) {

    this.cartService.cartdetails.DoPDate = this.selectedDeliveryDate;
    this.deliveryTimingsList = [];
    if (this.cartDetails && this.cartDetails.ListDoPTimeSlot) {
      this.deliveryTimingsList = this.cartDetails.ListDoPTimeSlot.filter(slot => slot.DoPDate === this.selectedDeliveryDate)
        .map(item => item.DoPSlot);
    }

    if (!isClicked && this.deliveryTimingsList.indexOf(this.cartDetails.DoPTimeSlot) >= 0) {
      this.selectedDeliveryTime = this.cartDetails.DoPTimeSlot;
      this.cartService.selectedDeliveryTime = this.selectedDeliveryTime;
    } else {
      this.selectedDeliveryTime = '';
      this.cartService.selectedDeliveryTime = this.selectedDeliveryTime;
      }
      if (this.selectedDeliveryTime !== '') {
        this.cartService.selectedDeliveryTime = this.selectedDeliveryTime;
        this.updateDeliveryTime();
    }
   this.cartDetails.DoPTimeSlot='';
  }

  updateDeliveryTime() {
    // tslint:disable-next-line:max-line-length
    this.utcitem = this.cartDetails.ListDoPTimeSlot.filter(item => item.DoPDate === this.selectedDeliveryDate && item.DoPSlot === this.selectedDeliveryTime);
    if (this.selectedDeliveryTime !== '') {
      this.cartService.selectedDeliveryTime = this.selectedDeliveryTime;
      this.cartDetails.DopUtcStartDate = this.utcitem[0].DSDopStartDate;
      this.cartDetails.DopUtcEndDate = this.utcitem[0].DSDopEndDate;
      this.cartService.cartdetails.DoPTimeSlot = this.selectedDeliveryTime;
      this.updateCart();
    }
  }
  updateCart() {
    this.progressBarService.show();
    this.cartService.cartdetails.CartDsp = 'Y';
    this.cartService.cartdetails.IsFromCheckOut = true;
    this.cartService.cartdetails.IsToCallDSP = true;
    this.checkpaymentTypeID = this.cartService.cartdetails.PaymentTypeId;
    this.cartService.updateCart(this.cartService.cartdetails).subscribe(
      (data: any) => {
        this.cartDetails = data;
        this.progressBarService.hide();
      });
  }
 saveProfile(){

    this.submitted = true;
    if (this.formProfile.invalid) {
      return;
    }
    const profile = {
      FirstName: '', LastName: '', EmailId: this.profile.EmailId,
      ContactNo: '', DOB: this.profile.DOB, Gender: this.profile.Gender, UserIpAddress: '', ProfileImage: this.profile.profileImage,
      StoreId: 0, SessionId: '', UserId: 0, AppId: 0, DeviceId: '', DeviceType: ''
    };

    profile.FirstName = this.formProfile.get('pFirstName').value;
    profile.LastName = this.formProfile.get('pLastName').value;
    profile.ContactNo = this.formProfile.get('pContactNo').value;


    this.customerService.updateCustomerProfile(profile).subscribe(
      (res) => {
        if (res) {
          this.toastr.success(res.SuccessMessage);
          this.cartService.cartdetails.Profile.ContactNo =profile.ContactNo;
          this.cartService.cartdetails.Profile.FirstName =profile.FirstName;
        this.cartService.cartdetails.Profile.LastName =profile.LastName;

          
        }
        this.progressBarService.hide();
        this.closeprofileModal.nativeElement.click();
      },
        error => {
          this.toastr.error(error);
          this.progressBarService.hide();
        });
 }

}

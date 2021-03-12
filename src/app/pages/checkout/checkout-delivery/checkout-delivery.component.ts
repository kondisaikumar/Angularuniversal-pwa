import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CustomerService } from '../../../services/customer.service';
// import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { CartService } from '../../../services/cart.service';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ProductStoreService } from '../../../services/product-store.service';


@Component({
  selector: 'app-checkout-delivery',
  templateUrl: './checkout-delivery.component.html',
  styleUrls: ['./checkout-delivery.component.scss']
})
export class CheckoutDeliveryComponent implements OnInit {
  addressList: any;
  selectedAddress: number;
  deliveryDatesList: any;
  deliveryTimingsList: any;
  selectedDeliveryDate: any;
  ShippingServices: any;
  selectedDeliveryTime: any;
  utcitem: any;
  cartDetails = this.cartService.cartdetails;
  storeDetails: any;
  shippingcode: any;
  clickedAddressId: any="";
  newAddressAdded: boolean=false;
  constructor(private customerService: CustomerService,
    // private spinnerService: Ng4LoadingSpinnerService,
    private cartService: CartService,
    private progressBarService: ProgressBarService,
    private storeService: ProductStoreService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private route: Router) {
      this.renderer.listen('window', 'click',(e:Event)=>{
        const clickedElement = e.target as HTMLElement;
        if(clickedElement.id !== "delButton"){
          this.clickedAddressId="";
        }
      }); 
      // this.cartService.cartdetails.subscribe((data => {
      //   this.cartDetails = data;
      //   if (this.cartDetails) {
      //     this.getDeliveryDates();
      //   }
      // }));
      this.cartService.backorderdate.subscribe(res=>{
        this.selectedDeliveryDate = '';
        this.selectedDeliveryTime = '';
      })
      this.cartService.cartNewDeliverySlots.subscribe(data => {
this.cartDetails = data;
if (this.cartDetails) {
  this.getDeliveryDates();
  if(this.cartDetails.ListShippingCharges) {
    const filteredShippingcharege = this.cartDetails.ListShippingCharges.filter(item => item.ServiceCode === this.cartDetails.ShippingServiceCode);
    this.ShippingServices = filteredShippingcharege[0].ShippingServices;
    // this.shippingcode = this.cartDetails.ShippingServiceCode
  }
}
      });
    }

  ngOnInit() {
    if (this.cartDetails) {
      this.getDeliveryDates();
      if(this.cartDetails.ListShippingCharges) {
        const filteredShippingcharege = this.cartDetails.ListShippingCharges.filter(item => item.ServiceCode === this.cartDetails.ShippingServiceCode);
        this.ShippingServices = filteredShippingcharege[0].ShippingServices;
      }
      // this.shippingcode = this.cartDetails.ShippingServiceCode
    }
    this.getAddressList();
    this.getStoreDetails();
  }
  getShipping(){
    if(this.cartDetails.ListShippingCharges) {
      const filteredShippingcharege = this.cartDetails.ListShippingCharges.filter(item => item.ShippingServices === this.ShippingServices);
      this.ShippingServices = filteredShippingcharege[0].ShippingServices;
      this.cartDetails.ShippingServiceCode = filteredShippingcharege[0].ServiceCode;
    }
    
    this.updateCart();
  }
  onDropdownClick(Id:any){
    this.clickedAddressId=Id
  
    }

  onPopupClose( data) {
    if(data){this.newAddressAdded=data.AddressId;}
    this.getAddressList();

  }
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
  getAddressList() {
    if (this.customerService.customerAddressList && this.customerService.customerAddressList.ListAddress) {
      this.addressList = this.customerService.customerAddressList.ListAddress;

      if (this.addressList.length === 1 && this.cartService.cartdetails.AddressId === 0) {
        this.cartService.cartdetails.AddressId = this.addressList[0].AddressId;
      }
    } else {
      // this.spinnerService.show();
      this.progressBarService.show();
      this.customerService.getCustomerAddressList().subscribe(
        data => {
          this.addressList = data ? (data.ListAddress ? data.ListAddress : []) : [];
          this.addressList = this.addressList.sort((x, y) => x.IsDefault > y.IsDefault ? -1 : 1);
          if (this.addressList && this.addressList.filter(address => address.IsDefault === true).length > 0) {
            this.cartService.cartdetails.AddressId = this.addressList.filter(address => address.IsDefault === true)[0].AddressId;
          } else if (this.addressList.length === 1 && this.cartService.cartdetails.AddressId === 0) {
            this.cartService.cartdetails.AddressId = this.addressList[0].AddressId;
          }
          // this.spinnerService.hide();
          this.progressBarService.hide();
        });
    }

    if(this.newAddressAdded){
      
      this.onSelectAddress(this.newAddressAdded);
    }
  }

  onSelectAddress(address) {
    this.cartService.cartdetails.AddressId = address.AddressId;
    if (this.cartDetails && this.cartDetails.DeliveryAddress
      && this.cartDetails.DeliveryAddress.Remark !== '') {
      this.cartDetails.DeliveryAddress.Remark = '';
    }

    this.updateCart();
  }

  
  getStoreDetails() {
    this.progressBarService.show();
    this.storeService.getStoreDetails().subscribe(data => {
      if (data && data.GetStoredetails) {
        this.storeDetails = data.GetStoredetails;
      }
      this.progressBarService.hide();
    });
  }
  updateCart() {
    this.progressBarService.show();
    this.cartService.cartdetails.CartDsp = 'Y';
    this.cartService.cartdetails.IsFromCheckOut = true;
    this.cartService.cartdetails.IsToCallDSP = true;
    this.cartService.updateCart(this.cartService.cartdetails).subscribe(
      (data: any) => {
        this.cartDetails = data;
        this.progressBarService.hide();
      });
  }

  onAddAddress() {
    this.route.navigate(['/myaccount/add-new-address'], { queryParams: { returnUrl: this.route.url } });
  }

  onEditAddress(addressId) {
    // routerLink="/myaccount/edit-address/{{address.AddressId}}"
    this.route.navigate(['/myaccount/edit-address/' + addressId], { queryParams: { returnUrl: this.route.url } });
  }

}

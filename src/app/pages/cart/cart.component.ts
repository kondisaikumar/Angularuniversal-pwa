import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ToastrService } from 'ngx-toastr';
import { ProductStoreService } from '../../services/product-store.service';
import { Store } from '@ngrx/store';
import { ProductStoreSelectors } from '../../state/product-store/product-store.selector';
import { CustomerLoginSession } from '../../models/customer-login-session';
import { ProgressBarService } from '../../shared/services/progress-bar.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit,OnDestroy{
  @ViewChild('openCartReviewModal') openModal: ElementRef;
  cartDetails: any;
  quantity = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
  reviewItems: any;
  storeGetHomeData: any;
  type: string;
  delcheckout = 'n';
  cartGetDetails: any;
  listCharges = []; 
  returnUrl: any;
  isLoading;
  constructor(private store: Store<CustomerLoginSession>,
    private cartService: CartService,
    private customerService: CustomerService,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    public appConfig: AppConfigService,
    private decimalPipe: DecimalPipe,
    private toastr: ToastrService,
    private storeService: ProductStoreService,
    private progressBarService: ProgressBarService) {
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'];
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
        }
      });
  }

  ngOnInit() { 
    this.isLoading=this.commonService.isCartLoading;
    this.getCartDetails();
  }
  ngAfterViewInit(){
   

  }

  getCartDetails() {
    this.progressBarService.show();
    let cartbody: any;
    cartbody = {
      IsFromCheckOut: false,
      IsToCallDSP: false
    };
    this.cartService.getCartDetails(cartbody).subscribe(
      (data: any) => {
        this.cartDetails = data;

        if (this.cartDetails && this.cartDetails.ListCartItem) {
          this.cartService.cartItemCount.next(this.cartDetails.CartItemCount);
        }
        
        this.doStockAvailabilityCheck();
        // this.spinnerService.hide();
        
        if(this.storeService.orderType){
        if(this.storeService.orderType==="Pickup"){
          this.onPickup()
          }
          if (this.storeService.orderType==="DeliveryOrderType") {
            this.onDelivery()
          }
          if (this.storeService.orderType==="ShippingOrderType") {
            this.onShipping()
          }
        }
          this.progressBarService.hide();
  
      });
  }

  doStockAvailabilityCheck() {
    if (!(this.cartDetails && this.cartDetails.ListCartItem)) {
      return;
    }

    this.reviewItems = this.cartDetails.ListCartItem.filter(item => item.Quantity !== item.QuantityOrdered);

    if (this.reviewItems && this.reviewItems.length > 0) {
      this.delcheckout = 'n';
      this.openModal.nativeElement.click();
    } else if (this.reviewItems.length === 0) {
      this.delcheckout = 'y';
    }

  }

  onPopupClose() {

    this.cartDetails.ListCartItem = this.cartDetails.ListCartItem.filter(item => item.Quantity !== 0);
    this.cartDetails.ListCartItem.map(item => item.QuantityOrdered = item.Quantity);

    this.updateCart();
  }

  onQtyChange(item: any) {
    item.QuantityOrdered = +item.QuantityOrdered;
    item.FinalItemTotal = this.decimalPipe.transform(item.FinalPrice * item.QuantityOrdered, '1.2-2');
    item.FinalItemTotalDisplay = '$' + item.FinalItemTotal;
    this.updateCart();
  }

  removeFromCart(item: any) {
    // this.spinnerService.show();
    this.progressBarService.show();
    this.cartService.removeFromCart(item).subscribe(
      (data: any) => {
        item.InCart = 0;
        if (this.cartDetails && this.cartDetails.ListCartItem) {
          const index = this.cartDetails.ListCartItem.indexOf(item);
          this.cartDetails.ListCartItem.splice(index, 1);
        }
        // this.spinnerService.hide();
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
        this.getCartDetails();
      });
  }

  updateCart() {
    this.progressBarService.show();
    this.cartService.updateCart(this.cartDetails).subscribe(
      (data: any) => {
        this.cartDetails = data;
        this.progressBarService.hide();
        if (this.cartDetails && this.cartDetails.Remark !== '') {
          this.toastr.error(this.cartDetails.Remark);
        }
        if (this.cartDetails && this.cartDetails.ListCartItem) {
          this.cartService.cartItemCount.next(this.cartDetails.CartItemCount);
        }
        this.doStockAvailabilityCheck();
      });
  }

  onPickup() {
    this.cartService.DeliveryInstruction = '';
    this.storeService.orderType = 'Pickup';
    this.cartDetails.PaymentTypeId = 2;
    this.cartDetails.AddressId = 0;
    this.cartDetails.OrderTypeId = 1;
    this.navigateURL();
    

  }

  onDelivery() {
    this.cartService.DeliveryInstruction = '';
    this.storeService.orderType = 'DeliveryOrderType';
    this.cartDetails.OrderTypeId = 2;
    this.cartDetails.PaymentTypeId = 1;
    const tip = this.cartDetails.ListCharge.filter(charge => charge.ChargeTitle === 'Tip')[0];
    if (tip) {
      this.cartDetails.TipForDriver = tip.ChargeAmount;
    } else {
      this.cartDetails.TipForDriver = -1;
    }

    this.navigateURL();
  }

  onShipping(){
    this.cartService.DeliveryInstruction = '';
    this.storeService.orderType = 'ShippingOrderType';
    this.cartDetails.OrderTypeId = 3;
    this.cartDetails.PaymentTypeId = 1;
    const tip = this.cartDetails.ListCharge.filter(charge => charge.ChargeTitle === 'Tip')[0];
    if (tip) {
      this.cartDetails.TipForDriver = tip.ChargeAmount;
    } else {
      this.cartDetails.TipForDriver = -1;
    }

    this.navigateURL();
  }
  navigateURL() {
    this.progressBarService.show();
    this.cartDetails.CartDsp = 'Y';
    this.cartDetails.IsFromCheckOut = false;
    this.cartDetails.IsToCallDSP = true;
    this.cartService.updateCart(this.cartDetails).subscribe(
      (data: any) => {
        this.progressBarService.hide();

        if (data && data.Remark !== '') {
          this.toastr.error(data.Remark);
          return;
        } else {
          this.router.navigate(['/checkout']);
        }

      });
  }
  navigateDelURL() {
    this.progressBarService.show();
    let cartbody: any;
    cartbody = {
      IsFromCheckOut: false,
      IsToCallDSP: true
    };
    this.cartService.getCartDetails(cartbody).subscribe(
      (data: any) => {
        this.cartGetDetails = data;
        this.progressBarService.hide();

        if (data && data.Remark !== '') {
          this.toastr.error(data.Remark);
          return;
        }
        if (!(this.cartGetDetails && this.cartGetDetails.ListCartItem)) {
          return;
        }
        this.reviewItems = this.cartGetDetails.ListCartItem.filter(item => item.Quantity !== item.QuantityOrdered);
        if (this.reviewItems && this.reviewItems.length > 0) {
          this.openModal.nativeElement.click();
        } else if (this.reviewItems.length === 0) {
          this.progressBarService.show();
          this.cartDetails.CartDsp = 'Y';
          this.cartDetails.IsFromCheckOut = false;
          this.cartDetails.IsToCallDSP = true;
          this.cartService.updateCart(this.cartDetails).subscribe(
            (response: any) => {
              this.progressBarService.hide();
              // console.log(response);
              if (response && response.Remark !== '') {
                this.toastr.error(response.Remark);
                return;
              } else {
                this.router.navigate(['/checkout']);
              }
            });
        }
      }
    );
  }

  getQty(item: any) {
    if (item && item.DealId !== 0 && item.IsBottleLimitAtRetail === false && item.DealInventory > 0) {
      return this.quantity.filter(qty => qty <= item.DealInventory);
    }
    return this.quantity;
  }
  ngOnDestroy(){
    this.commonService.isCartLoading=false;
  }

}

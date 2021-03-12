import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CommonService } from '../../shared/services/common.service';
import { OrdersService } from '../../services/orders.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ProductStoreService } from 'src/app/services/product-store.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit,OnDestroy {
  cartDetails: any;
  orderNumber: string;
  isOrderPlaced = false;
  orderInProgress = false;
  orderDetails: any;
  ListOrder: any;
  myOrdersList: any;
  constructor(private cartService: CartService,
    private spinnerService: Ng4LoadingSpinnerService,
    private storeService: ProductStoreService,
    private commonService: CommonService, private paymentService: PaymentService, private ordersService: OrdersService) {
    this.commonService.orderPlaced.subscribe(data => {
      this.orderInProgress = data;
    });
   }

  ngOnInit() {
    this.paymentService.createTransaction.cvv  = 0;
    this.isOrderPlaced = false;
    this.cartDetails = this.cartService.cartdetails;
  }
  
  ngOnDestroy() {
    this.storeService.orderType="";
    this.commonService.isGift = false;
  } 

  onOrderPlace(cartDetails) {
    if (cartDetails && cartDetails.OrderNo) {
this.cartService.cartItemCount.next(0);
      this.ordersService.getMyOrdersList(1).subscribe(
        (data: any) => {
          this.myOrdersList = data;
          this.orderNumber = '';
          this.orderNumber = cartDetails.OrderNo;
          this.ListOrder =  this.myOrdersList.ListOrder.filter(item => item.OrderNo === this.orderNumber);
          this.orderDetails = this.ListOrder[0];
          this.spinnerService.hide();
          this.isOrderPlaced = true;
          if(this.commonService.eventsProductAddedToCart===true){
            (<any>window).ga('eventTracking.send', 'event','Event&PromotionsPurchase',localStorage.getItem('storeId'),localStorage.getItem('PromotionTitle'));
            this.commonService.eventsProductAddedToCart=false;
          }
        });
    }
  }
}

import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
} from "@angular/core";
import { CartService } from "../../../services/cart.service";
import { PaymentService } from "../../../services/payment.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { PlaceOrderForOnlinePayment } from "../../../models/place-order-onlinepayment";
import { CustomerService } from "../../../services/customer.service";
import { Store } from "@ngrx/store";
import { CustomerLoginSession } from "../../../models/customer-login-session";
import { StoreGetHome } from "../../../state/product-store/product-store.action";
import { VantivPaymentServerSideApiService } from "../../../services/vantiv-payment-serverside-api.service";
import { CommonService } from "../../../shared/services/common.service";
import { ProgressBarService } from "../../../shared/services/progress-bar.service";
import { ProductStoreService } from "../../../services/product-store.service";
import { ProductStoreSelectors } from "src/app/state/product-store/product-store.selector";
import { AppConfigService } from "src/app/app-config.service";

@Component({
  selector: "app-checkout-products",
  templateUrl: "./checkout-products.component.html",
  styleUrls: ["./checkout-products.component.scss"],
})
export class CheckoutProductsComponent implements OnInit {
  paymentTypeId: number;
  checkoutButtonEnable: boolean = true;
  storeGetHomeData: any;
  @HostListener("window:popstate", ["$event"])
  onPopState(event) {
    this.storeService.orderType = "";
  }
  @Output() orderplace = new EventEmitter();
  @ViewChild("openCartReviewModal") openModal: ElementRef;
  @ViewChild("openPriceModal") openPriceModal: ElementRef;
  cartDetails: any;
  isCouponError = false;
  isExpand = false;
  isTipExpand = true;
  coupon = "#APPLYBESTCOUPON";
  couponCode: any;
  tipAmount: string;
  listCharges: any;
  isCouponApplied: boolean;
  isCheckoutSubmitted: boolean;
  reviewItems: any;
  oldCharge: any;
  oldSubTotal: any;
  reviewPrice: string;
  newCharge: any;
  hikecharge: any;
  couponAvailable = false;
  creditevent: boolean;
  creditutilizeresponse: any;
  OrderRewardCreditDisplay: any;
  constructor(
    private cartService: CartService,
    private router: Router,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private customerService: CustomerService,
    private progressBarService: ProgressBarService,
    private vantivPaymentService: VantivPaymentServerSideApiService,
    private store: Store<CustomerLoginSession>,
    private storeService: ProductStoreService,
     
    private commonService: CommonService,
    private appconfigService: AppConfigService
  ) {
    this.cartService.cartUpdated.subscribe(() => {
      this.cartDetails = this.cartService.cartdetails;
      if (
        this.cartService.selectedPaymentType !== "" &&
        this.cartService.selectedPaymentType === "payAtStore"
      ) {
        this.cartDetails.PaymentTypeId = this.cartService.cartdetails.PaymentTypeId;
      }
      this.filterCartDetails();
    });
    this.store.select(ProductStoreSelectors.productStoreStateData)
      .subscribe(pssd => {
        if (pssd) {
          this.storeGetHomeData = pssd;
        }
      });
  }

  ngOnInit() {
    this.checkoutButtonEnable = true
    this.couponCode = "";
    this.tipAmount = "";
    this.isCouponApplied = false;
    this.isCheckoutSubmitted = false;
    this.cartDetails = this.cartService.cartdetails;
    const OrderRewardCreditDisplay = this.cartDetails.OrderRewardCreditDisplay.replace(
      "o",
      ""
    );
    this.OrderRewardCreditDisplay = OrderRewardCreditDisplay.replace("-", "");
    this.filterCartDetails();
  }

  filterCartDetails() {
    this.cartDetails.ListCartItem = this.cartDetails.ListCartItem.filter(
      (item) => item.Quantity !== 0
    );
    this.cartDetails.ListCartItem.map(
      (item) => (item.QuantityOrdered = item.Quantity)
    );

    const tip = this.cartDetails.ListCharge.filter(
      (charge) => charge.ChargeTitle === "Tip"
    )[0];
    if (tip) {
      this.cartDetails.TipForDriver = tip.ChargeAmount;
      this.tipAmount = tip.ChargeAmountDisplay;
    }
    this.listCharges = this.cartDetails.ListCharge.filter(
      (charge) => charge.ChargeTitle !== "Tip"
    );

    if (
      this.cartDetails.OrderTypeId === 2 &&
      this.cartDetails.ListTipForDriver.length > 0
    ) {
      if (
        this.cartDetails.ListTipForDriver.filter(
          (item) => item.Percentage === 0
        ).length === 0
      ) {
        const otherTip = {
          Percentage: 0,
          TipAmount: "",
          TipAmountDisplay: "Other",
          IsDeafault: false,
        };
        this.cartDetails.ListTipForDriver.push(otherTip);
      }
    }
    this.oldSubTotal = this.cartDetails.SubTotal;
    const oldCharge = this.cartDetails.ListCharge.filter(
      (charge) => charge.ChargeId === 3
    )[0];
    if (oldCharge) {
      this.oldCharge = oldCharge.ChargeAmount;
    }
    //  console.log('old details', this.oldSubTotal, this.oldCharge);
  }
  updateCart() {
    this.cartDetails.CartDsp = "Y";
    this.cartDetails.IsFromCheckOut = true;
    this.cartDetails.IsToCallDSP = true;
    this.cartService.updateCart(this.cartDetails).subscribe((data: any) => {
      this.cartDetails = data;
      this.filterCartDetails();
    });
  }
  onTipSelected(event: any, tip: any) {
    this.cartDetails.ListTipForDriver.forEach((item) => {
      if (item.Percentage === tip.Percentage) {
        item.IsDeafault = true;
        // this.tipAmount = tip.TipAmountDisplay;
        this.cartDetails.TipForDriver = tip.TipAmount;
        if (tip.TipAmount !== "") {
          this.updateCart();
        }
      } else {
        item.IsDeafault = false;
      }
    });
  }

  applyCoupon() {
    if (this.coupon.trim() !== "" && !this.isCouponApplied) {
      this.cartDetails.CouponCode = this.coupon;
      this.cartDetails.CartDsp = "Y";
      this.cartDetails.IsFromCheckOut = true;
      this.cartDetails.IsToCallDSP = true;
      this.progressBarService.show();
      this.cartService.updateCart(this.cartDetails).subscribe((data: any) => {
        this.cartDetails = data;
        if (data.Remark === "") {
          this.isCouponApplied = true;
          this.progressBarService.hide();
          this.toastr.success("Coupon Applied Successfully.");
          this.couponAvailable = true;
          this.couponCode = "Applied Coupon " + this.cartDetails.CouponCode;

          this.filterCartDetails();
        } else {
          this.progressBarService.hide();
          if (this.cartDetails.CouponCode === "") {
            this.couponCode = "No Coupons Found";
          }
        }
      });
    }
  }

  clearCoupon() {
    this.coupon = "";
    this.isCouponApplied = false;
    if (this.cartDetails.CouponCode !== "") {
      this.cartDetails.CouponCode = this.coupon;
      this.cartDetails.CartDsp = "Y";
      this.cartDetails.IsFromCheckOut = true;
      this.cartDetails.IsToCallDSP = true;
      this.cartService.updateCart(this.cartDetails).subscribe((data: any) => {
        this.cartDetails = data;
        this.couponAvailable = false;
        this.coupon = "#APPLYBESTCOUPON";
        this.couponCode = "";
        this.filterCartDetails();
      });
    }
  }
  eventGiftCheck(event) {
    this.commonService.isGift = event.target.checked;
  }
  eventCheck(event) {
    this.creditevent = event.target.checked;
    const OrderRewardCreditDisplay = this.cartDetails.OrderRewardCreditDisplay.replace(
      "o",
      ""
    );
    this.OrderRewardCreditDisplay = OrderRewardCreditDisplay.replace("-", "");
    this.cartService
      .creditutilizeRequest(this.creditevent, this.cartDetails.CartId)
      .subscribe((data: any) => {
        this.creditutilizeresponse = data;
      });
  }

  onPopupClose() {
    this.router.navigate(["/cart"]);
  }
  onPricePopupClose() {
    this.updateCart();
  }
  checkDateTimeSlot() {
    if (this.cartDetails.OrderTypeId === 2 || this.cartDetails.OrderTypeId === 1) {

      let checkarray = [];
      checkarray = this.cartDetails.ListDoPTimeSlot.filter(item => item.DoPDate === this.cartDetails.DoPDate);
      if (checkarray.length > 0) {
        return true;
      } else {
        return false;
      }

    } else {
      return true;
    }

  }
  // checkout process begin
  onCheckout() {
    this.checkoutButtonEnable = false;
    // setTimeout(()=>{  this.checkoutButtonEnable=true},5000);
    if (this.cartDetails.SubTotal === 0) {
      this.router.navigate(["/cart"]);
    }
    if (this.cartDetails.PaymentTypeId === 2) {
      this.paymentTypeId = 2;
    }
    this.progressBarService.show();
    let cartbody: any;
    cartbody = {
      IsFromCheckOut: true,
      IsToCallDSP: true,
    };
    this.cartService.getCartDetails(cartbody).subscribe((response: any) => {
      this.cartDetails = response;
      this.progressBarService.hide();
      if ((this.paymentTypeId !== undefined) && (this.paymentTypeId !== this.cartDetails.PaymentTypeId)) {
        this.cartDetails.PaymentTypeId = this.paymentTypeId;
      }
      if (
        (this.cartDetails.OrderTypeId === 2 &&
          this.cartDetails.DeliveryAddress.Remark !== "") ||
        (this.cartDetails.IsDeliverySolution === true &&
          this.cartDetails.CartDeliverySolution.DeliverySolutionRemark !== "")
      ) {
        this.checkoutButtonEnable = true
        return;
      }
      if (response && response.Remark !== "") {
        this.toastr.error(response.Remark);
        this.checkoutButtonEnable = true
        return;
      }
      if (
        this.cartDetails.OrderTypeId === 1 &&
        (this.cartDetails.DoPDate === "" || this.cartDetails.DoPTimeSlot === "")
      ) {
        this.toastr.error("Please Setect Pickup Date and Time Slot");
         
        this.checkoutButtonEnable = true
        return;
      }
      if (
        this.cartDetails.OrderTypeId === 2 &&
        this.cartService.selectedDeliveryTime === ""
      ) {
        this.toastr.error("Please Select Delivery Date & Time");
        this.checkoutButtonEnable = true
        return;
      }
      if (!this.checkDateTimeSlot()) {
        this.cartService.backorderdate.next();
        this.toastr.error("Please Select Delivery Date & Time");
        this.checkoutButtonEnable = true
        return;
      }

      if (
        !this.cartDetails.Profile ||
        this.cartDetails.Profile.ContactNo === "" ||
        this.cartDetails.Profile.FirstName === "" ||
        this.cartDetails.Profile.LastName === ""
      ) {
        this.toastr.error("Please complete your profile");
        this.commonService.openProfileModal.next(true);
         
        this.checkoutButtonEnable = true
        return;
      }
      if (
        this.cartDetails.OrderTypeId !== 1 &&
        this.cartDetails.AddressId === 0
      ) {
        this.toastr.error("Please Select Address");
        this.checkoutButtonEnable = true
        return;
      }
      if (this.cartService.paymentProfiles.length === 0 && (this.paymentTypeId === 1 || this.paymentTypeId === 7 || this.paymentTypeId === undefined)) {
        this.toastr.error("Please Add Payment Card");
        this.checkoutButtonEnable = true
        return;
      }
      if (
        this.cartDetails.PaymentTypeId === 1 &&
        this.paymentService.createTransaction.customerPaymentProfileId === ""
      ) {
        this.toastr.error("Please Select Payment Method");
        this.checkoutButtonEnable = true
        return;
      }
      if (
        this.cartDetails.PaymentTypeId === 7 &&
        this.vantivPaymentService.vUserSelectedPaymentAccountID === ""
      ) {
        this.toastr.error("Please Select Payment Method");
        this.checkoutButtonEnable = true
        return;
      }
      if (
        (this.cartDetails.PaymentTypeId === 1 &&
          this.paymentService.createTransaction.cvv === 0) ||
        this.paymentService.createTransaction.cvv.toString() === ""
      ) {
        this.toastr.error("Please Enter CVV");
        this.checkoutButtonEnable = true
        return;
      }
      this.doStockAvailabilityCheck();
    });
  }
  doStockAvailabilityCheck() {
    if (!(this.cartDetails && this.cartDetails.ListCartItem)) {
      this.checkoutButtonEnable = true
      return;
    }
    this.reviewItems = this.cartDetails.ListCartItem.filter(
      (item) => item.Quantity !== item.QuantityOrdered
    );

    if (this.reviewItems && this.reviewItems.length > 0) {
      this.openModal.nativeElement.click();
    } else if (this.reviewItems && this.reviewItems.length === 0) {
      this.doCheckchangeinSubTotal();
    }
  }
  doCheckchangeinSubTotal() {
    if (this.cartDetails.SubTotal !== this.oldSubTotal) {
      this.reviewPrice =
        "There was a price change for some of the items in your cart please review before placing the order";
      this.checkoutButtonEnable = true
      this.openPriceModal.nativeElement.click();
    } else {
      this.doCheckHikeinDeliverycharge();
    }
  }
  doCheckHikeinDeliverycharge() {
    if (this.cartDetails.OrderTypeId !== 1) {
      this.newCharge = this.cartDetails.ListCharge.filter(
        (charge) => charge.ChargeId === 3
      )[0].ChargeAmount;
      // console.log(this.newCharge);
      this.hikecharge = (this.oldCharge / 100) * 10 + this.oldCharge;
      if (this.newCharge > this.hikecharge) {
        this.reviewPrice =
          "There is a change in your delivery charge, please review before placing the order";
        this.checkoutButtonEnable = true
        this.openPriceModal.nativeElement.click();
      } else {
        this.afterDoCheck();
      }
    } else if (this.cartDetails.OrderTypeId === 1) {
      this.afterDoCheck();
    }
  }
  afterDoCheck() {
    const data = {
      amount: this.creditevent
        ? this.cartDetails.OrderTotalWithCredit
        : this.cartDetails.TotalValue,
      taxAmount: this.appconfigService.canada ? this.cartDetails.TotalTax : this.cartDetails.ListCharge.filter(
        (item) => item.ChargeTitle === "Tax"
      )[0].ChargeAmount,
      taxType: "Sales Tax",
    };

    this.isCheckoutSubmitted = true;

    this.commonService.onOrderPlaced(true);
    if (this.cartDetails.PaymentTypeId === 2) {
      Object.assign(this.cartDetails, {
        UserRemarks: this.cartService.userRemarks,
      });
      this.placeOrder();
    } else if (this.cartDetails.PaymentTypeId === 1) {
      this.progressBarService.show();
      this.paymentService
        .createTransactionRequest(data)
        .subscribe((paymentResponse) => {
          const Cards = paymentResponse.AuthResponse;
          const cardData = JSON.parse(Cards);
          if (
            cardData.transactionResponse &&
            cardData.transactionResponse.responseCode === "1"
          ) {
            this.placeOrderForOnlinePayment(cardData);
            this.progressBarService.hide();
          } else if (
            cardData.transactionResponse &&
            cardData.transactionResponse.responseCode !== "1"
          ) {
            this.orderplace.emit();
            this.checkoutButtonEnable = true
            this.toastr.error(cardData.transactionResponse.errors[0].errorText);
            this.isCheckoutSubmitted = false;
            this.progressBarService.hide();
          }
        });
    } else if (this.cartDetails.PaymentTypeId === 7) {
      if (this.vantivPaymentService.vantiveProfile) {
        this.vantivPaymentService
          .CreditCardPayment(data.amount)
          .subscribe((paymentResponse: any) => {
            if (this.vantivPaymentService.vExpressResponseCode === "0") {
              this.placeOrderForOnlinePayment(
                this.parseVantivResponse(paymentResponse)
              );
            } else if (this.vantivPaymentService.vExpressResponseCode === "20") {
              this.toastr.error('There is an issue with your card, please contact your card issuer or use a different card');
              this.checkoutButtonEnable = true
              this.isCheckoutSubmitted = false;
            } else {
              this.toastr.error(paymentResponse.ExpressResponseMessage);
              this.checkoutButtonEnable = true
              this.isCheckoutSubmitted = false;
              this.orderplace.emit();
            }
          });
      }
    }
  }

  parseVantivResponse(response) {
    let req;
    let res;

    if (response.VantivAction === "Sale") {
      if (
        response.TransactionResponse &&
        response.TransactionResponse.CreditCardSaleResponse &&
        response.TransactionResponse.CreditCardSaleResponse.Response
      ) {
        res = response.TransactionResponse.CreditCardSaleResponse.Response;
      }
    } else {
      if (
        response.TransactionResponse &&
        response.TransactionResponse.CreditCardAuthorizationResponse &&
        response.TransactionResponse.CreditCardAuthorizationResponse.Response
      ) {
        res =
          response.TransactionResponse.CreditCardAuthorizationResponse.Response;
      }
    }
    if (res) {
      req = {
        Address: {
          BillingAddress1: res.Address.BillingAddress1 || "",
        },
        Batch: {
          // 'HostBatchAmount': '7946.21',
          HostBatchID: res.Batch.HostBatchID || "",
          // 'HostItemID': '352'
        },
        Card: {
          AVSResponseCode: res.Card.AVSResponseCode || "",
          BIN: res.Card.BIN || "",
          CardLogo: res.Card.CardLogo || "",
          CardNumberMasked: res.Card.CardNumberMasked || "",
        },
        ExpressResponseCode: res.ExpressResponseCode || "",
        ExpressResponseMessage: res.ExpressResponseMessage || "",
        ExpressTransactionDate: res.ExpressTransactionDate || "",
        ExpressTransactionTime: res.ExpressTransactionTime || "",
        ExpressTransactionTimezone: res.ExpressTransactionTimezone || "",
        HostResponseCode: res.HostResponseCode || "",
        HostResponseMessage: res.HostResponseMessage || "",
        PaymentAccount: {
          PaymentAccountID: this.vantivPaymentService
            .vUserSelectedPaymentAccountID,
          PaymentAccountReferenceNumber:
            res.PaymentAccount.PaymentAccountReferenceNumber,
        },
        Transaction: {
          AcquirerData: res.Transaction.AcquirerData,
          ApprovalNumber: res.Transaction.ApprovalNumber,
          ApprovedAmount: res.Transaction.ApprovedAmount,
          ProcessorName: res.Transaction.ProcessorName,
          ReferenceNumber: res.Transaction.ReferenceNumber,
          TransactionID: res.Transaction.TransactionID,
          TransactionStatus: res.Transaction.TransactionStatus,
          TransactionStatusCode: res.Transaction.TransactionStatusCode,
        },
      };
    }

    return req;
  }

  placeOrder() {
    this.cartService
      .placeOrder(this.cartDetails)
      .subscribe((orderResponse: any) => {
        this.cartDetails = orderResponse;
        if (this.cartDetails.OrderId !== 0) {
          this.commonService.onOrderPlaced(false);
          this.toastr.success("Order Placed Successfully.");
          this.progressBarService.hide();
          this.store.dispatch(new StoreGetHome());
        }
        this.isCheckoutSubmitted = false;
        this.checkoutButtonEnable = true
        this.progressBarService.hide();
        this.clearPaymentCache();
        this.orderplace.emit(this.cartDetails);
      });
  }

  placeOrderForOnlinePayment(data) {
    const placeOrderReq = this.getPlaceOrderRequestParamsForOnlinePayment(data);

    if (placeOrderReq) {
      if (placeOrderReq.PaymentTypeId === 7) {
        Object.assign(placeOrderReq, {
          VantivToken: placeOrderReq.CardInfo.PaymentAccount.PaymentAccountID,
        });
      }
      this.cartService
        .placeOrder(placeOrderReq)
        .subscribe((orderResponse: any) => {
          this.cartDetails = orderResponse;
          this.isCheckoutSubmitted = false;
          if (this.cartDetails.OrderId !== 0) {
            this.commonService.onOrderPlaced(false);
            this.checkoutButtonEnable = true
            this.toastr.success("Order Placed Successfully.");
            this.store.dispatch(new StoreGetHome());
          }
          this.clearPaymentCache();
          this.orderplace.emit(this.cartDetails);
        });
    } else {
      this.commonService.onOrderPlaced(false);
      this.checkoutButtonEnable = true
      this.toastr.error("Invalid Session, Please ReLogin ...");
    }
  }

  clearPaymentCache() {
    this.paymentService.createTransaction = {
      customerProfileId: "",
      customerPaymentProfileId: "",
      cvv: 0,
    };
    this.vantivPaymentService.vUserSelectedPaymentAccountID = "";
  }
  private getPlaceOrderRequestParamsForOnlinePayment(
    data: any
  ): PlaceOrderForOnlinePayment {
    if (!this.customerService.customerSession) {
      return null;
    }

    return {
      StoreId: this.customerService.customerSession.StoreId,
      SessionId: this.customerService.customerSession.SessionId,
      UserId: this.customerService.customerSession.UserId,
      AppId: this.customerService.customerSession.AppId,
      DeviceId: this.customerService.customerSession.DeviceId,
      DeviceType: this.customerService.customerSession.DeviceType,
      DoPDate:
        this.cartDetails.OrderTypeId === 2 ? this.cartDetails.DoPDate : "",
      DoPSlot:
        this.cartDetails.OrderTypeId === 2 ? this.cartDetails.DoPTimeSlot : "",
      CartId: this.cartDetails.CartId,
      CardInfo: data,
      UserRemarks: this.cartService.userRemarks,
      OrderTypeId: this.cartDetails.OrderTypeId,
      PaymentTypeId: this.cartDetails.PaymentTypeId,
      // tslint:disable-next-line:max-line-length
      DeliverySolutionEstimateId:
        this.cartDetails.OrderTypeId === 2 &&
          this.cartDetails.IsDeliverySolution === true
          ? this.cartDetails.DeliverySolutionEstimateId
          : "",
    };
  }
  onCancelOrder() {
    this.clearPaymentCache();
    this.isCheckoutSubmitted = false;
    this.router.navigate(["/cart"]);
    this.storeService.orderType = "";
  }
}

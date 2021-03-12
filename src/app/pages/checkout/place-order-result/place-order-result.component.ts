import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../shared/services/common.service';
import { VantivPaymentServerSideApiService } from '../../../services/vantiv-payment-serverside-api.service';
import { AppConfigService } from '../../../app-config.service';
import { OrdersService } from 'src/app/services/orders.service';
import { ProgressBarService } from 'src/app/shared/services/progress-bar.service';
declare var gtag: Function;
@Component({
  selector: 'app-place-order-result',
  templateUrl: './place-order-result.component.html',
  styleUrls: ['./place-order-result.component.scss']
})
export class PlaceOrderResultComponent implements OnInit {
  @Input() orderNumber: string;
  @Input() orderDetails: any;
  @Input() myOrdersList: any;
  orderInvoice: any;
  constructor(private router: Router, private ordersService: OrdersService, private progressBarService: ProgressBarService,
    private commonService: CommonService, private appConfig: AppConfigService,
    private vantivPaymentService: VantivPaymentServerSideApiService) {
    if (this.orderNumber !== '' && this.appConfig.appID === 10322) {
      gtag('event', 'conversion', {
        'send_to': 'AW-718037129/5mlcCO_bwacBEInBsdYC',
        'transaction_id': this.orderNumber
      });
    }
  }

  ngOnInit() {
    this.orderInvoice = this.orderDetails;
    this.commonService.onOrderPlaced(false);
    this.vantivPaymentService.vUserSelectedPaymentAccountID = '';
  }
  printComponent(cmpName) {
    const printContent = document.getElementById(cmpName);
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write(printContent.innerHTML);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  onContinueShoping() {
    this.router.navigate(['/']);
  }

}

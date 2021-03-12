import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VantivURLs } from '../../../app-config.service';
import { VantivPaymentServerSideApiService } from '../../../services/vantiv-payment-serverside-api.service';
import { CustomerService } from '../../../services/customer.service';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { VantivResponseCodes } from '../../../services/vantiv-responsecodes';
@Component({
  selector: 'app-addvpayment',
  templateUrl: './addvpayment.component.html',
  styleUrls: ['./addvpayment.component.scss']
})
export class AddvpaymentComponent implements OnInit {
  @ViewChild ('closemodal') closemodal: ElementRef;
  @Output() close = new EventEmitter();
  url: SafeResourceUrl;
  add_card_url: string;
  setupTransactionURL: string;
  ifrm: HTMLIFrameElement;
  addressList: any;
  returnUrl: string;
  captcha: boolean=true;
  loading: boolean;

  constructor(public sanitizer: DomSanitizer,
    private vantivPaymentService: VantivPaymentServerSideApiService,
    private customerService: CustomerService,
    private progressBarService: ProgressBarService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/myaccount/vantiv-payment-methods';
    this.url = '';
    this.vantivPaymentService.vTransactionSetupID = '';
    this.getAddressList();
  }
  onCapthaValidatetrue(){
    this.setURL();
    this.captcha = false;
  }
  onCapthaValidatefalse(){
    this.captcha = true;
  }
  setupTransactionId() {
    if (!this.vantivPaymentService.vTransactionSetupID) {
       
      // this.vantivPaymentService.setupTransactionID().subscribe(() => {

        this.setURL();
        // this.saveRequestAndResponse();
      // });
    } else {
      this.setURL();
    }
  }

  getAddressList() {
    if (this.customerService.customerAddressList && this.customerService.customerAddressList.ListAddress) {
      this.addressList = this.customerService.customerAddressList.ListAddress;
      const defaultAddress = this.addressList.filter(address => address.IsDefault === true)[0];

      if (defaultAddress) {
        this.vantivPaymentService.setBillingAddress(defaultAddress);
      }
      this.setupTransactionId();
    } else {
      this.progressBarService.show();
      this.customerService.getCustomerAddressList().subscribe(
        data => {
          this.addressList = data ? (data.ListAddress ? data.ListAddress : []) : [];
          this.progressBarService.hide();

          const defaultAddress = this.addressList.filter(address => address.IsDefault === true)[0];
          if (defaultAddress) {
            this.vantivPaymentService.setBillingAddress(defaultAddress);
          }
          this.setupTransactionId();
        });
    }
  }

  setURL() {
    this.setupTransactionURL = '';
    this.vantivPaymentService.parseSetupTransactionResponse(this.customerService.TransactionSetupID);
    this.add_card_url = VantivURLs.hostedPayments + this.vantivPaymentService.vTransactionSetupID;
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.add_card_url);
  }

  onLoad() {
    this.loading =true;
    this.ifrm = <HTMLIFrameElement>document.getElementById('myIframe');
    if (this.add_card_url === this.ifrm.src) {
      if (this.setupTransactionURL === '') {
        this.setupTransactionURL = this.add_card_url;
        this.loading =false;
      } else {
        this.progressBarService.show();
        this.vantivPaymentService.onCardValidationSuccessGetTransactionDetails(
          this.vantivPaymentService.vTransactionSetupID).subscribe(data => {
            this.progressBarService.hide();
            this.vantivPaymentService.vTransactionSetupID = '';

            if (data && data.QueryTransactionDetails && data.QueryTransactionDetails.length > 0) {
              const res = data.QueryTransactionDetails[0];

              if (res && (res.ExpressResponseCode === '0')
                && ['X', 'Y', 'Z', 'D', 'M'].indexOf(res.AVSResponseCode.trim()) !== -1
                && res.CVVResponseCode.trim() === 'M') {
                this.getPaymentAccountId();
              } else {
                this.showProperErrorMessage(res);
                this.captcha = true;
                this.closemodal.nativeElement.click();
              }
            }
            else{
              this.toastr.error("Entered card details or Address/Zip Code Incorrect")
              this.setupTransactionId();
              this.captcha = true;
              this.closemodal.nativeElement.click();
            } 
            // this.saveRequestAndResponse();
          });
        // this.vantivPaymentService.vTransactionSetupID = '';
        // alert(this.ifrm.src);
        // console.log(this.ifrm.src);
      }
    }
  }

  private showProperErrorMessage(res) {
    if (!res.AVSResponseCode) {
      this.toastr.error('Sorry, Can not add given Card details.');
      this.setupTransactionId();
      this.captcha = true;
      this.closemodal.nativeElement.click();
      return;
    }
    const avsCode = VantivResponseCodes.AVSInfo.filter( item => item.AVSCode === res.AVSResponseCode.trim())[0];

    if (avsCode && avsCode.AVSMessage !== '') {
      this.setupTransactionId();
      this.toastr.error(avsCode.AVSMessage);
      this.captcha = true;
      this.closemodal.nativeElement.click();
      // this.router.navigate(['/myaccount/vantiv-payment-methods']);
      return;
    }

    if (!res.CVVResponseCode) {
      this.toastr.error('Sorry, Can not add given Card details.');
      this.setupTransactionId();
      this.captcha = true;
      this.closemodal.nativeElement.click();
      return;
    }
    const cvvInfo = VantivResponseCodes.CVVInfo.filter( item => item.CVVCode === res.CVVResponseCode.trim())[0];

    if (cvvInfo && cvvInfo.CVVMessage !== '') {
      this.toastr.error(cvvInfo.CVVMessage);
      this.setupTransactionId();
      this.captcha = true;
      this.closemodal.nativeElement.click();
      // this.router.navigate(['/myaccount/vantiv-payment-methods']);
    }
  }

  getPaymentAccountId() {
    this.progressBarService.show();
    this.vantivPaymentService.OnSuccessParseDetailsForAddCardRequest().subscribe(data => {
      this.progressBarService.hide();
      this.setupTransactionId();
      this.close.emit();
      this.captcha = true;
      this.closemodal.nativeElement.click();
    });
  }
}

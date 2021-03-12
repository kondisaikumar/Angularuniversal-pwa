import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CustomerService } from 'src/app/services/customer.service';
import { ToastrService } from 'ngx-toastr';
import reCaptchaStoreList from '../../../../../assets/reCaptchaStoreList.json'

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss']
})
export class CaptchaComponent implements OnInit {
  @ViewChild('recaptcha') recaptchaElement: ElementRef;
  @Output() captcharesulttrue = new EventEmitter();
  @Output() captcharesultfalse = new EventEmitter();
  reCaptchaList:any=reCaptchaStoreList;
  constructor(  private customerService: CustomerService,
    private toastr: ToastrService,) { }

  ngOnInit() {
    this.addRecaptchaScript();
  }
  renderReCaptch() {

  let url=window.location.href;
  // let url="https://kenyonsmarket.com/checkout"
  let reCaptchaObj=this.reCaptchaList.reCaptchaStoreList.find((item)=>url.includes(item.domain));
  let key;
  switch(reCaptchaObj.storeCat) {
    // case "A":
    //   {
    //   key="6Lfe2XIaAAAAAAHKMRCHwA7UpQ8u9mNabVT_OaCA"
    //   }
    //   break;
    case "A":
      {
      key="6Lcvuc0ZAAAAAIWSKelgIdmjUPVBW72Ru1UxYcmp"
      }
      break;
    case "B":
      {
        key="6Ldvuc0ZAAAAAOqHWTFs99C0dX8szm4KcgBndpmE"
        }
      break;
      case "C":
        {
          key="6LeLuc0ZAAAAANo631cedz8I-PGCrFeT2bhKo0Ch"
          }
      break;
      case "D":
        {
          key="6Lehuc0ZAAAAABgtAqG3vtIOITxroALJwnC-lHzo"
          }
      break;
      case "E":
        {
          key="6Lexuc0ZAAAAAHC66gDCDhdMYQb9jH_QqNeJuOA2"
          }
      break;
      case "F":
        {
          key="6LdAGs8ZAAAAAO7wnv5z8lgo3Zhv2EqB6JizJGN6"
          }
      break;
      case "G":
        {
          key="6LeWdS0aAAAAAP4xD3rVgBQN7JzHsCQzROZaDQIQ"
          }
      break;
   
  }
 window['grecaptcha'].render(this.recaptchaElement.nativeElement, {
   'sitekey' : key,
   'callback': (response) => {
      this.customerService.validateCaptcha(response,reCaptchaObj.storeCat).subscribe((res: any) => {
  if(res.Success === true || res.Success === false){
    if(res.Success === true){
    this.captcharesulttrue.emit();
  } else {
   this.captcharesultfalse.emit();
  }
  } else{
        if(res.ExpressResponseMessage === 'Success' && res.ExpressResponseCode === "0"){
    this.captcharesulttrue.emit();
  } else {
    this.toastr.error(res.ExpressResponseMessage);
   this.captcharesultfalse.emit();
  }
}
       });
      }
    });
  }
 
  addRecaptchaScript() {
 
    window['grecaptchaCallback'] = () => {
      this.renderReCaptch();
    }
 
    (function(d, s, id, obj){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { obj.renderReCaptch(); return;}
      js = d.createElement(s); js.id = id;
      js.src = "https://www.google.com/recaptcha/api.js?onload=grecaptchaCallback&amp;render=explicit";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'recaptcha-jssdk', this));
 
  }
}

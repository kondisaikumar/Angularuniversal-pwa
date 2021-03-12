import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-addauthpayment',
  templateUrl: './addauthpayment.component.html',
  styleUrls: ['./addauthpayment.component.scss']
})
export class AddauthpaymentComponent implements OnInit {
  captcha = true;

  constructor() { }

  ngOnInit() {
  }
  onCapthaValidatetrue(){
    this.captcha = false;
  }
  onCapthaValidatefalse(){
    this.captcha = true;
  }
}

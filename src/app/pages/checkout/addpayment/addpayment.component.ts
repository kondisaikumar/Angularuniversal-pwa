import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
@Component({
  selector: 'app-addpayment',
  templateUrl: './addpayment.component.html',
  styleUrls: ['./addpayment.component.scss']
})
export class AddpaymentComponent implements OnInit {
  @Output() close = new EventEmitter();
  @ViewChild('closemodal') closemodal: ElementRef;
  captcha = true;
  ngOnInit(){

  }
  onCapthaValidatetrue(){
    this.captcha = false;
  }
  onCapthaValidatefalse(){
    this.captcha = true;
  }
  closeModal(){
    this.close.emit();
    this.closemodal.nativeElement.click();
  }
}

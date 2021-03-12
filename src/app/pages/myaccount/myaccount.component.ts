import { Component, OnInit ,ViewChild, ElementRef} from '@angular/core';
import { CustomerService } from '../../services/customer.service';
//  
import { ProgressBarService } from '../../shared/services/progress-bar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyAccountComponent implements OnInit {
  @ViewChild('margin') margin: ElementRef;
  selectedOption: string;
  profileDetails: any;
 ;
  
  constructor(private router: Router,
    private customerService: CustomerService,
    //  
    private progressBarService: ProgressBarService) { }

  ngOnInit() {
    if (this.router.url.includes('/myaccount/favorites')){
      this.margin.nativeElement.style.backgroundColor = '#f5f5f5';
        }
    
    this.progressBarService.show();
    this.getCustomerProfile();
   
  }

  getCustomerProfile() {
    this.customerService.getProfileDetails().subscribe(
      (data: any) => {
        this.profileDetails = data;
        
        this.progressBarService.hide();
      });
  }
  onOptionSelected(option: string) {
    this.selectedOption = option;

    if (option === 'payment') {

      this.customerService.getCustomerPaymentMethodGetList().subscribe(
        () => {
          if (this.customerService.paymentTypeId === 1) {
            this.router.navigate(['myaccount/payment-methods']);
          } else if (this.customerService.paymentTypeId === 7) {
            this.router.navigate(['myaccount/vantiv-payment-methods']);
          }
        });
    }
  }
}

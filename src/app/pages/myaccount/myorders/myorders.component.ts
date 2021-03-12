import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
//  
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
@Component({
  selector: 'app-myorders',
  templateUrl: './myorders.component.html',
  styleUrls: ['./myorders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  myOrdersList: any;
  page = 1;

  constructor(private ordersService: OrdersService,
    //  
    private progressBarService: ProgressBarService) { }

  ngOnInit() {
    this.getMyOrders();
  }

  getMyOrders() {
    
    this.progressBarService.show();
    this.ordersService.getMyOrdersList(this.page).subscribe(
      (data: any) => {
        this.myOrdersList = data;
        
        this.progressBarService.hide();
      });
  }

  onOrderCancelled() {
    this.getMyOrders();
  }

  onPageChange(pageNo) {
    this.page = pageNo;
    this.getMyOrders();
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { ProductStoreService } from '../../../services/product-store.service';
import { CartService } from '../../../services/cart.service';
//  
import { ToastrService } from 'ngx-toastr';
import { ProgressBarService } from '../../../shared/services/progress-bar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() item: any;
  storeid: string;
  constructor(private productService: ProductStoreService,
    private cartService: CartService, public router: Router,
    //  
    private toastr: ToastrService,
    private progressBarService: ProgressBarService) { }

  ngOnInit() {
    this.storeid = localStorage.getItem('storeId');
  }

  favoriteProductUpdate(status: boolean) {
    
    this.progressBarService.show();
    this.productService.favoriteProductUpdate(this.item.PID, status).subscribe(
      (data: any) => {
        this.item.IsFavorite = data.IsFavorite;
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }

  addToCart(item: any) {
    
    this.progressBarService.show();
    this.cartService.addToCard(item.PID, 1).subscribe(
      (data: any) => {
        item.InCart = 1;
        this.cartService.cartItemCount.next(data.CartItemCount);
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }

  removeFromCart(item: any) {
    
    this.progressBarService.show();
    this.cartService.removeFromCart(item).subscribe(
      (data: any) => {
        item.InCart = 0;
        this.cartService.cartItemCount.next(data.CartItemCount);
        
        this.progressBarService.hide();
        this.toastr.success(data.SuccessMessage);
      });
  }
}

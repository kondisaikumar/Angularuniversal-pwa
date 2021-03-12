import { Component, OnChanges, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '../../../../../node_modules/@angular/router';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit, OnChanges {
  @Input() rate;
  @Input() edit;
  @Output() rated = new EventEmitter<number>();

  starList: any;
  productDetailPage: boolean;
  constructor(private router: Router) {}
ngOnInit() {
if (this.router.url.startsWith('/product-details')) {
this.productDetailPage = true;
} else {
  this.productDetailPage = false;
}
}
  ngOnChanges() {
    this.setStar(this.rate);
  }

  setStar(rate: number) {
    rate = +rate;
    this.rated.emit(rate);
    this.starList = [0, 0, 0, 0, 0];

    for (let i = 0; i < rate; i++) {
      this.starList[i] = 1;
    }

    if (!Number.isInteger(rate)) {
      this.starList[Math.floor(rate)] = 0.5;
    }
  }

}

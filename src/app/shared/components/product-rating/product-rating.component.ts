import { Component, OnChanges, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-productrating',
  templateUrl: './product-rating.component.html',
  styleUrls: ['./product-rating.component.css']
})
export class ProductRatingComponent implements OnInit, OnChanges {
  @Input() rate;
  @Input() edit;
  @Output() rated = new EventEmitter<number>();

  starList: any;
  productDetailPage: boolean;
  constructor(private router: Router) {}
ngOnInit() {}
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

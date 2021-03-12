import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-agelimit',
  templateUrl: './agelimit.component.html',
  styleUrls: ['./agelimit.component.scss']
})
export class AgelimitComponent implements OnInit {
  @Output() ageVerified = new EventEmitter<boolean>();
  sorryPopup = false;
  legalDate: Date;
  constructor(private commonService: CommonService) {
    this.commonService.agePopUp.subscribe((res: any) => {

    });
   }

  ngOnInit() {
    this.legalDate = new Date(new Date().getFullYear() - 21, new Date().getMonth(), new Date().getDate());
  }

  onAgeVarify() {
    localStorage.setItem('isAgeVerified', 'true');
    this.ageVerified.emit(true);
  }

}

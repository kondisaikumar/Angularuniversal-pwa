import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddauthpaymentComponent } from './addauthpayment.component';

describe('AddauthpaymentComponent', () => {
  let component: AddauthpaymentComponent;
  let fixture: ComponentFixture<AddauthpaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddauthpaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddauthpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

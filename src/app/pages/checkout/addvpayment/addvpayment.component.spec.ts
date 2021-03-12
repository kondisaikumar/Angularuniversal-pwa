import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddvpaymentComponent } from './addvpayment.component';

describe('AddvpaymentComponent', () => {
  let component: AddvpaymentComponent;
  let fixture: ComponentFixture<AddvpaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddvpaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddvpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

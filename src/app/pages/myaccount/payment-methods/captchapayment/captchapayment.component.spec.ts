import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptchapaymentComponent } from './captchapayment.component';

describe('CaptchapaymentComponent', () => {
  let component: CaptchapaymentComponent;
  let fixture: ComponentFixture<CaptchapaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptchapaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptchapaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

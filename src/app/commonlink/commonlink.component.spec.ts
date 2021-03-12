import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonlinkComponent } from './commonlink.component';

describe('CommonlinkComponent', () => {
  let component: CommonlinkComponent;
  let fixture: ComponentFixture<CommonlinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonlinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

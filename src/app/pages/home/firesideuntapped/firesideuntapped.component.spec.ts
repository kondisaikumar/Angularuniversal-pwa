import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiresideuntappedComponent } from './firesideuntapped.component';

describe('FiresideuntappedComponent', () => {
  let component: FiresideuntappedComponent;
  let fixture: ComponentFixture<FiresideuntappedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiresideuntappedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiresideuntappedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

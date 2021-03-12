import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingstaffTopPicksComponent } from './landingstaff-top-picks.component';

describe('LandingstaffTopPicksComponent', () => {
  let component: LandingstaffTopPicksComponent;
  let fixture: ComponentFixture<LandingstaffTopPicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingstaffTopPicksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingstaffTopPicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

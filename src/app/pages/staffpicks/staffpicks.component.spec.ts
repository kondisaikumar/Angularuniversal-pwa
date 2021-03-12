import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffpicksComponent } from './staffpicks.component';

describe('StaffpicksComponent', () => {
  let component: StaffpicksComponent;
  let fixture: ComponentFixture<StaffpicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffpicksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffpicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

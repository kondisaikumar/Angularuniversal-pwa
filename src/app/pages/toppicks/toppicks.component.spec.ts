import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToppicksComponent } from './toppicks.component';

describe('ToppicksComponent', () => {
  let component: ToppicksComponent;
  let fixture: ComponentFixture<ToppicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToppicksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToppicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

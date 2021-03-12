import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildauthorizecardComponent } from './childauthorizecard.component';

describe('ChildauthorizecardComponent', () => {
  let component: ChildauthorizecardComponent;
  let fixture: ComponentFixture<ChildauthorizecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildauthorizecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildauthorizecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

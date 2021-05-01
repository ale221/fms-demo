import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftReportingComponent } from './shift-reporting.component';

describe('ShiftReportingComponent', () => {
  let component: ShiftReportingComponent;
  let fixture: ComponentFixture<ShiftReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

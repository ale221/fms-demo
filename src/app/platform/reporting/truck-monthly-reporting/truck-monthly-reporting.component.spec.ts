import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckMonthlyReportingComponent } from './truck-monthly-reporting.component';

describe('TruckMonthlyReportingComponent', () => {
  let component: TruckMonthlyReportingComponent;
  let fixture: ComponentFixture<TruckMonthlyReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckMonthlyReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckMonthlyReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

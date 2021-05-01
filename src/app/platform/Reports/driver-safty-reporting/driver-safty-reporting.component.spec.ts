import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverSaftyReportingComponent } from './driver-safty-reporting.component';

describe('DriverSaftyReportingComponent', () => {
  let component: DriverSaftyReportingComponent;
  let fixture: ComponentFixture<DriverSaftyReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverSaftyReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverSaftyReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

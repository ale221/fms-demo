import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverProfileReportingComponent } from './driver-profile-reporting.component';

describe('DriverProfileReportingComponent', () => {
  let component: DriverProfileReportingComponent;
  let fixture: ComponentFixture<DriverProfileReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverProfileReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverProfileReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

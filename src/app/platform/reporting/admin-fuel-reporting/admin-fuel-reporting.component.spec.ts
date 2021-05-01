import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFuelReportingComponent } from './admin-fuel-reporting.component';

describe('AdminFuelReportingComponent', () => {
  let component: AdminFuelReportingComponent;
  let fixture: ComponentFixture<AdminFuelReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminFuelReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFuelReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

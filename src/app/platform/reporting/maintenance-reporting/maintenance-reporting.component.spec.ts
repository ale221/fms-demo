import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceReportingComponent } from './maintenance-reporting.component';

describe('MaintenanceReportingComponent', () => {
  let component: MaintenanceReportingComponent;
  let fixture: ComponentFixture<MaintenanceReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverJobDashboardComponent } from './driver-job-dashboard.component';

describe('DriverJobDashboardComponent', () => {
  let component: DriverJobDashboardComponent;
  let fixture: ComponentFixture<DriverJobDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverJobDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverJobDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

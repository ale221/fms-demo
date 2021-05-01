import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityReportingComponent } from './activity-reporting.component';

describe('ActivityReportingComponent', () => {
  let component: ActivityReportingComponent;
  let fixture: ComponentFixture<ActivityReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

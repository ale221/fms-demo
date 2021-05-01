import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgnitionReportingComponent } from './ignition-reporting.component';

describe('IgnitionReportingComponent', () => {
  let component: IgnitionReportingComponent;
  let fixture: ComponentFixture<IgnitionReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgnitionReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgnitionReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

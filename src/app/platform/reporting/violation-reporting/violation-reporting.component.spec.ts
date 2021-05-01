import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationReportingComponent } from './violation-reporting.component';

describe('ViolationReportingComponent', () => {
  let component: ViolationReportingComponent;
  let fixture: ComponentFixture<ViolationReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

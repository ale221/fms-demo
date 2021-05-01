import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FillupReportingComponent } from './fillup-reporting.component';

describe('FillupReportingComponent', () => {
  let component: FillupReportingComponent;
  let fixture: ComponentFixture<FillupReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FillupReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillupReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

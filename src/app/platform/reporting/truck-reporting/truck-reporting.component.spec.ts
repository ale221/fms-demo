import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckReportingComponent } from './truck-reporting.component';

describe('TruckReportingComponent', () => {
  let component: TruckReportingComponent;
  let fixture: ComponentFixture<TruckReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

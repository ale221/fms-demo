import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApexBasicRadialarBarChartComponent } from './apex-basic-radialar-bar-chart.component';

describe('ApexBasicRadialarBarChartComponent', () => {
  let component: ApexBasicRadialarBarChartComponent;
  let fixture: ComponentFixture<ApexBasicRadialarBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApexBasicRadialarBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApexBasicRadialarBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

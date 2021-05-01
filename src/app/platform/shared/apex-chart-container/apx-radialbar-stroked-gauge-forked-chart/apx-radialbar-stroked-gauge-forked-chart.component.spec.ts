import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApxRadialbarStrokedGaugeForkedChartComponent } from './apx-radialbar-stroked-gauge-forked-chart.component';

describe('ApxRadialbarStrokedGaugeForkedChartComponent', () => {
  let component: ApxRadialbarStrokedGaugeForkedChartComponent;
  let fixture: ComponentFixture<ApxRadialbarStrokedGaugeForkedChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApxRadialbarStrokedGaugeForkedChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApxRadialbarStrokedGaugeForkedChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

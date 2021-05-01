import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetdashboardchartComponent } from './fleetdashboardchart.component';

describe('FleetdashboardchartComponent', () => {
  let component: FleetdashboardchartComponent;
  let fixture: ComponentFixture<FleetdashboardchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FleetdashboardchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetdashboardchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

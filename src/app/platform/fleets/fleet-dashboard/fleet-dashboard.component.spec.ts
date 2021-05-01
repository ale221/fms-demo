import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetDashboardComponent } from './fleet-dashboard.component';

describe('FleetDashboardComponent', () => {
  let component: FleetDashboardComponent;
  let fixture: ComponentFixture<FleetDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FleetDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

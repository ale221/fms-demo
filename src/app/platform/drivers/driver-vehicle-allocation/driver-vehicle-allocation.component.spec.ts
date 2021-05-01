import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverVehicleAllocationComponent } from './driver-vehicle-allocation.component';

describe('DriverVehicleAllocationComponent', () => {
  let component: DriverVehicleAllocationComponent;
  let fixture: ComponentFixture<DriverVehicleAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverVehicleAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverVehicleAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

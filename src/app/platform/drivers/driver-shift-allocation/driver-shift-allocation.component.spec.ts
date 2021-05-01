import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverShiftAllocationComponent } from './driver-shift-allocation.component';

describe('DriverShiftAllocationComponent', () => {
  let component: DriverShiftAllocationComponent;
  let fixture: ComponentFixture<DriverShiftAllocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriverShiftAllocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverShiftAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

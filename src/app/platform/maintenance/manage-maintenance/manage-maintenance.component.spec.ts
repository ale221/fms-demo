import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMaintenanceComponent } from './manage-maintenance.component';

describe('ManageMaintenanceComponent', () => {
  let component: ManageMaintenanceComponent;
  let fixture: ComponentFixture<ManageMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceDataFormComponent } from './maintenance-data-form.component';

describe('MaintenanceDataFormComponent', () => {
  let component: MaintenanceDataFormComponent;
  let fixture: ComponentFixture<MaintenanceDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

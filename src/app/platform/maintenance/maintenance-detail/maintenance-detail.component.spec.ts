import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceDetailComponent } from './maintenance-detail.component';

describe('MaintenanceDetailComponent', () => {
  let component: MaintenanceDetailComponent;
  let fixture: ComponentFixture<MaintenanceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintenanceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintenanceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

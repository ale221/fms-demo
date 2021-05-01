import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFuelFormComponent } from './admin-fuel-form.component';

describe('AdminFuelFormComponent', () => {
  let component: AdminFuelFormComponent;
  let fixture: ComponentFixture<AdminFuelFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminFuelFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFuelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

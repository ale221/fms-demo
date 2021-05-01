import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPermissionsFormComponent } from './admin-permissions-form.component';

describe('AdminPermissionsFormComponent', () => {
  let component: AdminPermissionsFormComponent;
  let fixture: ComponentFixture<AdminPermissionsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPermissionsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPermissionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

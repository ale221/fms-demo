import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRouteComponent } from './admin-routes.component';

describe('AdminRouteComponent', () => {
  let component: AdminRouteComponent;
  let fixture: ComponentFixture<AdminRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

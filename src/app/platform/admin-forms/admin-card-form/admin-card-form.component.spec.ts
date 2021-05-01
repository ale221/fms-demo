import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCardFormComponent } from './admin-card-form.component';

describe('AdminCardFormComponent', () => {
  let component: AdminCardFormComponent;
  let fixture: ComponentFixture<AdminCardFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCardFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

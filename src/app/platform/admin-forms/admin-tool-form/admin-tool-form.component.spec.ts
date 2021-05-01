import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminToolFormComponent } from './admin-tool-form.component';

describe('AdminToolFormComponent', () => {
  let component: AdminToolFormComponent;
  let fixture: ComponentFixture<AdminToolFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminToolFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminToolFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

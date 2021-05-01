import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGraphFormComponent } from './admin-graph-form.component';

describe('AdminGraphFormComponent', () => {
  let component: AdminGraphFormComponent;
  let fixture: ComponentFixture<AdminGraphFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminGraphFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminGraphFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

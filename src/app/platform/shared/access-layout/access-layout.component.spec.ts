import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessLayoutComponent } from './access-layout.component';

describe('AccessLayoutComponent', () => {
  let component: AccessLayoutComponent;
  let fixture: ComponentFixture<AccessLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

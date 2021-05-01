import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationsComponent } from './violations.component';

describe('ViolationsComponent', () => {
  let component: ViolationsComponent;
  let fixture: ComponentFixture<ViolationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViolationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

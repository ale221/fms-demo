import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDropdownComponent } from './area-dropdown.component';

describe('AreaDropdownComponent', () => {
  let component: AreaDropdownComponent;
  let fixture: ComponentFixture<AreaDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

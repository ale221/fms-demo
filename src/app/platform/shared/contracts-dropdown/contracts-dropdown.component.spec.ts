import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractsDropdownComponent } from './contracts-dropdown.component';

describe('ContractsDropdownComponent', () => {
  let component: ContractsDropdownComponent;
  let fixture: ComponentFixture<ContractsDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractsDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

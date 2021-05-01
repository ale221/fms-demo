import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDropdownComponent } from './client-dropdown.component';

describe('ClientDropdownComponent', () => {
  let component: ClientDropdownComponent;
  let fixture: ComponentFixture<ClientDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

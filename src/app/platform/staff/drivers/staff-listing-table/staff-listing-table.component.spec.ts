import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffListingTableComponent } from './staff-listing-table.component';

describe('StaffListingTableComponent', () => {
  let component: StaffListingTableComponent;
  let fixture: ComponentFixture<StaffListingTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffListingTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffListingTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

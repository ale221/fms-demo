import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashBoardDriverComponent } from './dash-board-driver.component';

describe('DashBoardDriverComponent', () => {
  let component: DashBoardDriverComponent;
  let fixture: ComponentFixture<DashBoardDriverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashBoardDriverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashBoardDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

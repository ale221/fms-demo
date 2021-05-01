import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticschartComponent } from './statisticschart.component';

describe('StatisticschartComponent', () => {
  let component: StatisticschartComponent;
  let fixture: ComponentFixture<StatisticschartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticschartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticschartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

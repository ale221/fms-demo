import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartFiltersComponent } from './chart-filters.component';

describe('ChartFiltersComponent', () => {
  let component: ChartFiltersComponent;
  let fixture: ComponentFixture<ChartFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

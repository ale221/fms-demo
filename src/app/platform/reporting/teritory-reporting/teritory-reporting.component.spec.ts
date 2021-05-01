import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeritoryReportingComponent } from './teritory-reporting.component';

describe('TeritoryReportingComponent', () => {
  let component: TeritoryReportingComponent;
  let fixture: ComponentFixture<TeritoryReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeritoryReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeritoryReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

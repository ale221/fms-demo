import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpdmeterchartComponent } from './spdmeterchart.component';

describe('SpdmeterchartComponent', () => {
  let component: SpdmeterchartComponent;
  let fixture: ComponentFixture<SpdmeterchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpdmeterchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpdmeterchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

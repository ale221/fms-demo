import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantinanceprobabilitychartComponent } from './mantinanceprobabilitychart.component';

describe('MantinanceprobabilitychartComponent', () => {
  let component: MantinanceprobabilitychartComponent;
  let fixture: ComponentFixture<MantinanceprobabilitychartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MantinanceprobabilitychartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantinanceprobabilitychartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

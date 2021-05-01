import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetPoiComponent } from './fleet-poi.component';

describe('FleetPoiComponent', () => {
  let component: FleetPoiComponent;
  let fixture: ComponentFixture<FleetPoiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FleetPoiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FleetPoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

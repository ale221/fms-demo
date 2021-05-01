import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleMapDriverDashboardComponent } from './google-map-driver-dashboard.component';

describe('GoogleMapDriverDashboardComponent', () => {
  let component: GoogleMapDriverDashboardComponent;
  let fixture: ComponentFixture<GoogleMapDriverDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoogleMapDriverDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleMapDriverDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

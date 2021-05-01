import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IolDashboardComponent } from './iol-dashboard.component';

describe('IolDashboardComponent', () => {
  let component: IolDashboardComponent;
  let fixture: ComponentFixture<IolDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IolDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IolDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusteredGraphComponent } from './clustered-graph.component';

describe('ClusteredGraphComponent', () => {
  let component: ClusteredGraphComponent;
  let fixture: ComponentFixture<ClusteredGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusteredGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusteredGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

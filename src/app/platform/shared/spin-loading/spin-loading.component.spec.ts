import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpinLoadingComponent } from './spin-loading.component';

describe('SpinLoadingComponent', () => {
  let component: SpinLoadingComponent;
  let fixture: ComponentFixture<SpinLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpinLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpinLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

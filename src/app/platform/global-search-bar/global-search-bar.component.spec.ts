import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchBar } from './global-search-bar.component';

describe('GlobalSearchBar', () => {
  let component: GlobalSearchBar;
  let fixture: ComponentFixture<GlobalSearchBar>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalSearchBar ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemMetaInformationComponent } from './item-meta-information.component';

describe('ItemMetaInformationComponent', () => {
  let component: ItemMetaInformationComponent;
  let fixture: ComponentFixture<ItemMetaInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemMetaInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemMetaInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

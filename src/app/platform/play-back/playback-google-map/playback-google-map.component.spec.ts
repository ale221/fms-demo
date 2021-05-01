import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaybackGoogleMapComponent } from './playback-google-map.component';

describe('PlaybackGoogleMapComponent', () => {
  let component: PlaybackGoogleMapComponent;
  let fixture: ComponentFixture<PlaybackGoogleMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaybackGoogleMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaybackGoogleMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

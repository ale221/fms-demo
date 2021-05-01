import { TestBed, inject } from '@angular/core/testing';

import { GetIconsService } from './get-icons.service';

describe('GetIconsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetIconsService]
    });
  });

  it('should be created', inject([GetIconsService], (service: GetIconsService) => {
    expect(service).toBeTruthy();
  }));
});

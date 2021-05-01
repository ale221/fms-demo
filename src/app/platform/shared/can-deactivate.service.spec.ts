import { TestBed, inject } from '@angular/core/testing';

import { CanDeactivateService } from './can-deactivate.service';

describe('CanDeactivateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateService]
    });
  });

  it('should be created', inject([CanDeactivateService], (service: CanDeactivateService) => {
    expect(service).toBeTruthy();
  }));
});

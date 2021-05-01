import { TestBed, inject } from '@angular/core/testing';

import { CustomClassService } from './custom-class.service';

describe('CustomClassService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomClassService]
    });
  });

  it('should be created', inject([CustomClassService], (service: CustomClassService) => {
    expect(service).toBeTruthy();
  }));
});

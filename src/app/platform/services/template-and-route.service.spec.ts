import { TestBed, inject } from '@angular/core/testing';

import { TemplateAndRouteService } from './template-and-route.service';

describe('TemplateAndRouteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplateAndRouteService]
    });
  });

  it('should be created', inject([TemplateAndRouteService], (service: TemplateAndRouteService) => {
    expect(service).toBeTruthy();
  }));
});

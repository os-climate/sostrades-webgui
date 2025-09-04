import { TestBed } from '@angular/core/testing';

import { ReferenceGenerationObserverService } from './reference-generation-observer.service';

describe('ReferenceGenerationObserverService', () => {
  let service: ReferenceGenerationObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferenceGenerationObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

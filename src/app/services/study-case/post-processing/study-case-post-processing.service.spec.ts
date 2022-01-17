import { TestBed } from '@angular/core/testing';

import { StudyCasePostProcessingService } from './study-case-post-processing.service';

describe('StudyCasePostProcessingService', () => {
  let service: StudyCasePostProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCasePostProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

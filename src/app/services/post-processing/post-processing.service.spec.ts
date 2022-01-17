import { TestBed } from '@angular/core/testing';

import { PostProcessingService } from './post-processing.service';

describe('PostProcessingService', () => {
  let service: PostProcessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostProcessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

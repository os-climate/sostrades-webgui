import { TestBed } from '@angular/core/testing';

import { PostProcessingHttpService } from './post-processing-http.service';

describe('PostProcessingHttpService', () => {
  let service: PostProcessingHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostProcessingHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

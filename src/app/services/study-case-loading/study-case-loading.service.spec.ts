import { TestBed } from '@angular/core/testing';

import { StudyCaseLoadingService } from './study-case-loading.service';

describe('StudyCaseExecutionObserverService', () => {
  let service: StudyCaseLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
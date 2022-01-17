import { TestBed } from '@angular/core/testing';

import { StudyCaseExecutionObserverService } from './study-case-execution-observer.service';

describe('StudyCaseExecutionObserverService', () => {
  let service: StudyCaseExecutionObserverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseExecutionObserverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

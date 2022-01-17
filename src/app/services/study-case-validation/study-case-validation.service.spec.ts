import { TestBed } from '@angular/core/testing';

import { StudyCaseValidationService } from './study-case-validation.service';

describe('StudyCaseValidationService', () => {
  let service: StudyCaseValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

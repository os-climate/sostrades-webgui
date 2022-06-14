import { TestBed } from '@angular/core/testing';

import { StudyCaseCreationService } from './study-case-creation.service';

describe('StudyCaseCreationService', () => {
  let service: StudyCaseCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

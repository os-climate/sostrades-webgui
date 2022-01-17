import { TestBed } from '@angular/core/testing';

import { StudyCaseDataService } from './study-case-data.service';

describe('StudyCaseDataService', () => {
  let service: StudyCaseDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

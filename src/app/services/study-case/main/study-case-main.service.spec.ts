import { TestBed } from '@angular/core/testing';

import { StudyCaseMainService } from './study-case-main.service';

describe('StudyCaseMainService', () => {
  let service: StudyCaseMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

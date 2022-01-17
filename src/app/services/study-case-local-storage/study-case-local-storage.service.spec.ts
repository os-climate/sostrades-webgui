import { TestBed } from '@angular/core/testing';

import { StudyCaseLocalStorageService } from './study-case-local-storage.service';

describe('StudyCaseLocalStorageService', () => {
  let service: StudyCaseLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyCaseLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

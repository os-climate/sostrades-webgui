import { TestBed } from '@angular/core/testing';

import { ReferenceMainService } from './reference-main.service';

describe('ReferenceMainService', () => {
  let service: ReferenceMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferenceMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

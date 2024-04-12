import { TestBed } from '@angular/core/testing';

import { FlavorsService } from './flavors.service';

describe('FlavorsService', () => {
  let service: FlavorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlavorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

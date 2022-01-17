import { TestBed } from '@angular/core/testing';

import { D3UtilitiesService } from './d3-utilities.service';

describe('D3UtilitiesService', () => {
  let service: D3UtilitiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(D3UtilitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

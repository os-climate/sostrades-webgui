import { TestBed } from '@angular/core/testing';

import { ProxyMapService } from './proxy-map.service';

describe('ProxyMapService', () => {
  let service: ProxyMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProxyMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

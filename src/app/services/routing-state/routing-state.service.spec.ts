import { TestBed } from '@angular/core/testing';

import { RoutingState } from './routing-state.service';

describe('RoutingState', () => {
  let service: RoutingState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

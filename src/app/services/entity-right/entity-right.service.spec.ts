import { TestBed } from '@angular/core/testing';

import { EntityRightService } from './entity-right.service';

describe('EntityRightService', () => {
  let service: EntityRightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityRightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

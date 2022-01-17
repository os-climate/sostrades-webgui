import { TestBed } from '@angular/core/testing';

import { GroupDataService } from './group-data.service';

describe('GroupDataService', () => {
  let service: GroupDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

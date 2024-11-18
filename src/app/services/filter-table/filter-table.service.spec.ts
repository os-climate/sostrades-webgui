import { TestBed } from '@angular/core/testing';

import { FilterTableService } from './filter-table.service';

describe('FilterTableService', () => {
  let service: FilterTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

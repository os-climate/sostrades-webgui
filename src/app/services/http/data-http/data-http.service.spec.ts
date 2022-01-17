import { TestBed } from '@angular/core/testing';

import { DataHttpService } from './data-http.service';

describe('DataHttpService', () => {
  let service: DataHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

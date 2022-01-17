import { TestBed } from '@angular/core/testing';

import { MainHttpService } from './main-http.service';

describe('MainHttpService', () => {
  let service: MainHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

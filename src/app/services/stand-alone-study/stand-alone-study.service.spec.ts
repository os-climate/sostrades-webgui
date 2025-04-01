import { TestBed } from '@angular/core/testing';

import { StandAloneStudyService } from './stand-alone-study.service';

describe('StandAloneStudyService', () => {
  let service: StandAloneStudyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandAloneStudyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

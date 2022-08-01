import { TestBed } from '@angular/core/testing';

import { OntologyDirectService } from './ontology-direct.service';

describe('OntologyDirectService', () => {
  let service: OntologyDirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OntologyDirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

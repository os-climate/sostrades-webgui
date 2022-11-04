import { TestBed } from '@angular/core/testing';

import { OntologyHttpService } from './ontology-http.service';

describe('OntologyHttpService', () => {
  let service: OntologyHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OntologyHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ContactDialogService } from './contact-dialog.service';

describe('ContactDialogService', () => {
  let service: ContactDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

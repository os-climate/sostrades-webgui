import { TestBed } from '@angular/core/testing';

import { StudyDialogService } from './study-dialog.service';

describe('StudyDialogService', () => {
  let service: StudyDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudyDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

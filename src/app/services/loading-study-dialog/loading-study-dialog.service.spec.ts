import { TestBed } from '@angular/core/testing';

import { LoadingStudyDialogService } from './loading-study-dialog.service';

describe('LoadingStudyDialogService', () => {
  let service: LoadingStudyDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingStudyDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

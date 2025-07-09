import { TestBed } from '@angular/core/testing';

import { EmbedDashboardService } from './embed-dashboard.service';

describe('EmbedDashboardService', () => {
  let service: EmbedDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmbedDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { GithubOAuthService } from './github-oauth.service';

describe('GithubService', () => {
  let service: GithubOAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GithubOAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { KeycloakOAuthService } from './keycloak-oauth.service';

describe('KeycloakService', () => {
  let service: KeycloakOAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeycloakOAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

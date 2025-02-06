import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationErrorComponent } from './authentication-error.component';

describe('AuthenticationErrorComponent', () => {
  let component: AuthenticationErrorComponent;
  let fixture: ComponentFixture<AuthenticationErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthenticationErrorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthenticationErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

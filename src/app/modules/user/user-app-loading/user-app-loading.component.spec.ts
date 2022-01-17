import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAppLoadingComponent } from './user-app-loading.component';

describe('UserAppLoadingComponent', () => {
  let component: UserAppLoadingComponent;
  let fixture: ComponentFixture<UserAppLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAppLoadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAppLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

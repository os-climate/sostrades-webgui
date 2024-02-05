import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInformationDialogComponent } from './login-information-dialog.component';

describe('LoginInformationDialogComponent', () => {
  let component: LoginInformationDialogComponent;
  let fixture: ComponentFixture<LoginInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginInformationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

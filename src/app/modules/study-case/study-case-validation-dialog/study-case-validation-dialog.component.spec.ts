import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseValidationDialogComponent } from './study-case-validation-dialog.component';

describe('StudyCaseValidationDialogComponent', () => {
  let component: StudyCaseValidationDialogComponent;
  let fixture: ComponentFixture<StudyCaseValidationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseValidationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseValidationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

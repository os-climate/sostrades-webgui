import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseValidationSumUpComponent } from './study-case-validation-sum-up.component';

describe('StudyCaseValidationSumUpComponent', () => {
  let component: StudyCaseValidationSumUpComponent;
  let fixture: ComponentFixture<StudyCaseValidationSumUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseValidationSumUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseValidationSumUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

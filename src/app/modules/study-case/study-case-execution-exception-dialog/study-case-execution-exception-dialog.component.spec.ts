import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseExecutionExceptionDialogComponent } from './study-case-execution-exception-dialog.component';

describe('ExceptionDialogComponent', () => {
  let component: StudyCaseExecutionExceptionDialogComponent;
  let fixture: ComponentFixture<StudyCaseExecutionExceptionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseExecutionExceptionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseExecutionExceptionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

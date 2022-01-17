import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseExecutionDialogComponent } from './study-case-execution-dialog.component';

describe('StudyCaseExecutionDialogComponent', () => {
  let component: StudyCaseExecutionDialogComponent;
  let fixture: ComponentFixture<StudyCaseExecutionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseExecutionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseExecutionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

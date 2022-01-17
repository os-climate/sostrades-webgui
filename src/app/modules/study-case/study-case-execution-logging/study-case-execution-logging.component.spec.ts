import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseExecutionLoggingComponent } from './study-case-execution-logging.component';

describe('LoggingComponent', () => {
  let component: StudyCaseExecutionLoggingComponent;
  let fixture: ComponentFixture<StudyCaseExecutionLoggingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseExecutionLoggingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseExecutionLoggingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

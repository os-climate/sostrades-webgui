import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionSequenceComponent } from './visualisation-execution-sequence.component';

describe('ExecutionSequenceComponent', () => {
  let component: ExecutionSequenceComponent;
  let fixture: ComponentFixture<ExecutionSequenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExecutionSequenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

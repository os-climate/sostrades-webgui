import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseExecutionManagementComponent } from './study-case-execution-management.component';

describe('StudyCaseExecutionManagementComponent', () => {
  let component: StudyCaseExecutionManagementComponent;
  let fixture: ComponentFixture<StudyCaseExecutionManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseExecutionManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseExecutionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

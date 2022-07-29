import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseLoggingComponent } from './study-case-logging.component';

describe('StudyCaseLoggingComponent', () => {
  let component: StudyCaseLoggingComponent;
  let fixture: ComponentFixture<StudyCaseLoggingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseLoggingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseLoggingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseStatusInformationComponent } from './study-case-status-information.component';

describe('StudyCaseStatusInformationComponent', () => {
  let component: StudyCaseStatusInformationComponent;
  let fixture: ComponentFixture<StudyCaseStatusInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseStatusInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseStatusInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

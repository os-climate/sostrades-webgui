import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseLinkInformationComponent } from './study-case-link-information.component';

describe('StudyLinkComponent', () => {
  let component: StudyCaseLinkInformationComponent;
  let fixture: ComponentFixture<StudyCaseLinkInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseLinkInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseLinkInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

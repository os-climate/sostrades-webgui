import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseManagementContainerComponent } from './study-case-management-container.component';

describe('StudyCaseManagementContainerComponent', () => {
  let component: StudyCaseManagementContainerComponent;
  let fixture: ComponentFixture<StudyCaseManagementContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseManagementContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseManagementContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

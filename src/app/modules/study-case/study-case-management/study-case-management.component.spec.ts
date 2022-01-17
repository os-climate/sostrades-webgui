import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseManagementComponent } from './study-case-management.component';

describe('StudyCaseManagementComponent', () => {
  let component: StudyCaseManagementComponent;
  let fixture: ComponentFixture<StudyCaseManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

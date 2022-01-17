import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseNotificationsChangesDialogComponent } from './study-case-notifications-changes-dialog.component';

describe('StudyCaseNotificationsChangesDialogComponent', () => {
  let component: StudyCaseNotificationsChangesDialogComponent;
  let fixture: ComponentFixture<StudyCaseNotificationsChangesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseNotificationsChangesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseNotificationsChangesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

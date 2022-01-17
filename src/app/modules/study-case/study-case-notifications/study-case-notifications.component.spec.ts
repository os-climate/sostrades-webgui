import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseNotificationsComponent } from './study-case-notifications.component';

describe('StudyCaseNotificationsComponent', () => {
  let component: StudyCaseNotificationsComponent;
  let fixture: ComponentFixture<StudyCaseNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

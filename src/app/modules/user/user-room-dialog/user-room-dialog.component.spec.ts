import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoomDialogComponent } from './user-room-dialog.component';

describe('UserRoomDialogComponent', () => {
  let component: UserRoomDialogComponent;
  let fixture: ComponentFixture<UserRoomDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRoomDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

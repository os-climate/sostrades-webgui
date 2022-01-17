import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserNoRightsComponent } from './user-no-rights.component';

describe('UserNoRightsComponent', () => {
  let component: CurrentUserNoRightsComponent;
  let fixture: ComponentFixture<CurrentUserNoRightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentUserNoRightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentUserNoRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

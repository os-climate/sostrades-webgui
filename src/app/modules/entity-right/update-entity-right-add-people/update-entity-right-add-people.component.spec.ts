import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEntityRightAddPeopleComponent } from './update-entity-right-add-people.component';

describe('UpdateEntityRightAddPeopleComponent', () => {
  let component: UpdateEntityRightAddPeopleComponent;
  let fixture: ComponentFixture<UpdateEntityRightAddPeopleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateEntityRightAddPeopleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEntityRightAddPeopleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

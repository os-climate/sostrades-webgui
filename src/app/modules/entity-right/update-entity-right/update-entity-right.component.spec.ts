import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEntityRightComponent } from './update-entity-right.component';

describe('UpdateEntityRightComponent', () => {
  let component: UpdateEntityRightComponent;
  let fixture: ComponentFixture<UpdateEntityRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateEntityRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEntityRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

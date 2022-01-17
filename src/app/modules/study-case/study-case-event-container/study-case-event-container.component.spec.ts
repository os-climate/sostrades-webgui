import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseEventContainerComponent } from './study-case-event-container.component';

describe('StudyCaseEventContainerComponent', () => {
  let component: StudyCaseEventContainerComponent;
  let fixture: ComponentFixture<StudyCaseEventContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseEventContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseEventContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

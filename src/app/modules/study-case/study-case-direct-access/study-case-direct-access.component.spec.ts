import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseDirectAccessComponent } from './study-case-direct-access.component';

describe('StudyCaseDirectAccessComponent', () => {
  let component: StudyCaseDirectAccessComponent;
  let fixture: ComponentFixture<StudyCaseDirectAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseDirectAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseDirectAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

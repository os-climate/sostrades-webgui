import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseCreationComponent } from './study-case-creation.component';

describe('StudyCaseCreationComponent', () => {
  let component: StudyCaseCreationComponent;
  let fixture: ComponentFixture<StudyCaseCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseCreationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

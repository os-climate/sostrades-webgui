import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseEditComponent } from './study-case-edit.component';

describe('StudyCaseEditComponent', () => {
  let component: StudyCaseEditComponent;
  let fixture: ComponentFixture<StudyCaseEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudyCaseEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

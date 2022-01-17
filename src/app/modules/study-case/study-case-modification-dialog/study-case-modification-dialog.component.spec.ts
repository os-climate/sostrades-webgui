import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseModificationDialogComponent } from './study-case-modification-dialog.component';

describe('StudyCaseModificationDialogComponent', () => {
  let component: StudyCaseModificationDialogComponent;
  let fixture: ComponentFixture<StudyCaseModificationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseModificationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseModificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

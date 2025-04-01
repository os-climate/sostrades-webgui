import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCaseExportDialogComponent } from './study-case-export-dialog.component';

describe('StudyCaseExportDialogComponent', () => {
  let component: StudyCaseExportDialogComponent;
  let fixture: ComponentFixture<StudyCaseExportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCaseExportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCaseExportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

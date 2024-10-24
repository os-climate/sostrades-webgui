import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingStudyDialogComponent } from './loading-study-dialog.component';

describe('LoadingStudyDialogComponent', () => {
  let component: LoadingStudyDialogComponent;
  let fixture: ComponentFixture<LoadingStudyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingStudyDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingStudyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

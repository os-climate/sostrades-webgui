import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionFormDialogComponent } from './edition-form-dialog.component';

describe('EditionFormDialogComponent', () => {
  let component: EditionFormDialogComponent;
  let fixture: ComponentFixture<EditionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditionFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

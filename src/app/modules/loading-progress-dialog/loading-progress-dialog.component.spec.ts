import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingProgressDialogComponent } from './loading-progress-dialog.component';

describe('LoadingProgressDialogComponent', () => {
  let component: LoadingProgressDialogComponent;
  let fixture: ComponentFixture<LoadingProgressDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingProgressDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingProgressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

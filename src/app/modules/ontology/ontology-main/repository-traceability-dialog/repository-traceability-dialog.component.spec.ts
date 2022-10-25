import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepositoryTraceabilityDialogComponent } from './repository-traceability-dialog.component';

describe('RepositoryTraceabilityDialogComponent', () => {
  let component: RepositoryTraceabilityDialogComponent;
  let fixture: ComponentFixture<RepositoryTraceabilityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RepositoryTraceabilityDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositoryTraceabilityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

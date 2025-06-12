import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSectionDialogComponent } from './dashboard-section-dialog.component';

describe('DashboardSectionDialogComponent', () => {
  let component: DashboardSectionDialogComponent;
  let fixture: ComponentFixture<DashboardSectionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardSectionDialogComponent]
    });
    fixture = TestBed.createComponent(DashboardSectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

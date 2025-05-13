import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTextDialogComponent } from './dashboard-text-dialog.component';

describe('DashboardTextDialogComponent', () => {
  let component: DashboardTextDialogComponent;
  let fixture: ComponentFixture<DashboardTextDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTextDialogComponent]
    });
    fixture = TestBed.createComponent(DashboardTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

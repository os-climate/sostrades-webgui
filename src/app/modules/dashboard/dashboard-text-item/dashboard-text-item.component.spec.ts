import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTextItemComponent } from './dashboard-text-item.component';

describe('DashboardTextItemComponent', () => {
  let component: DashboardTextItemComponent;
  let fixture: ComponentFixture<DashboardTextItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardTextItemComponent]
    });
    fixture = TestBed.createComponent(DashboardTextItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

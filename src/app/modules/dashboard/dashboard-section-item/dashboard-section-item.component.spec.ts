import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSectionItemComponent } from './dashboard-section-item.component';

describe('DashboardSectionItemComponent', () => {
  let component: DashboardSectionItemComponent;
  let fixture: ComponentFixture<DashboardSectionItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardSectionItemComponent]
    });
    fixture = TestBed.createComponent(DashboardSectionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

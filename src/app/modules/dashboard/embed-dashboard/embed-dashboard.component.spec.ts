import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedDashboardComponent } from './embed-dashboard.component';

describe('EmbedDashboardComponent', () => {
  let component: EmbedDashboardComponent;
  let fixture: ComponentFixture<EmbedDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmbedDashboardComponent]
    });
    fixture = TestBed.createComponent(EmbedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

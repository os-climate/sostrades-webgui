import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PodSettingsComponent } from './pod-settings.component';

describe('PodSettingsComponent', () => {
  let component: PodSettingsComponent;
  let fixture: ComponentFixture<PodSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PodSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PodSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

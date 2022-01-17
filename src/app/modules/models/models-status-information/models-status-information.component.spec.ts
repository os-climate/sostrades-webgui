import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsStatusInformationComponent } from './models-status-information.component';

describe('ModelStatusInformationComponent', () => {
  let component: ModelsStatusInformationComponent;
  let fixture: ComponentFixture<ModelsStatusInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsStatusInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsStatusInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

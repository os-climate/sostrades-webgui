import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsStatusDocumentationComponent } from './models-status-documentation.component';

describe('ModelsStatusDocumentationComponent', () => {
  let component: ModelsStatusDocumentationComponent;
  let fixture: ComponentFixture<ModelsStatusDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelsStatusDocumentationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsStatusDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

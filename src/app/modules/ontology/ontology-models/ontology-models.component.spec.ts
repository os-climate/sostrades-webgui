import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyModelsComponent } from './ontology-models.component';

describe('OntologyModelsComponent', () => {
  let component: OntologyModelsComponent;
  let fixture: ComponentFixture<OntologyModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyModelsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

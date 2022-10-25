import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyModelsInformationComponent } from './ontology-models-information.component';

describe('OntologyModelsInformationComponent', () => {
  let component: OntologyModelsInformationComponent;
  let fixture: ComponentFixture<OntologyModelsInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyModelsInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyModelsInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

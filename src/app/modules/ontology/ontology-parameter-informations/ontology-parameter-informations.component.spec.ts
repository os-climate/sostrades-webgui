import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyParameterInformationsComponent } from './ontology-parameter-informations.component';

describe('OntologyParameterInformationsComponent', () => {
  let component: OntologyParameterInformationsComponent;
  let fixture: ComponentFixture<OntologyParameterInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyParameterInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyParameterInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

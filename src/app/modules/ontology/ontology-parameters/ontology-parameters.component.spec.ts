import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyParametersComponent } from './ontology-parameters.component';

describe('OntologyParametersComponent', () => {
  let component: OntologyParametersComponent;
  let fixture: ComponentFixture<OntologyParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

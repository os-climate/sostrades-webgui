import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyProcessInformationComponent } from './ontology-process-information.component';

describe('OntolyProcessInformationComponent', () => {
  let component: OntologyProcessInformationComponent;
  let fixture: ComponentFixture<OntologyProcessInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyProcessInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyProcessInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

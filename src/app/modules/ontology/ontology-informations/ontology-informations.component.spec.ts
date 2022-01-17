import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyInformationsComponent } from './ontology-informations.component';

describe('OntologyInformationsComponent', () => {
  let component: OntologyInformationsComponent;
  let fixture: ComponentFixture<OntologyInformationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyInformationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyProcessesComponent } from './ontology-processes.component';

describe('OntologyProcessesComponent', () => {
  let component: OntologyProcessesComponent;
  let fixture: ComponentFixture<OntologyProcessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyProcessesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyProcessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

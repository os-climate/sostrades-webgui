import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyContainerComponent } from './ontology-container.component';

describe('OntologyContainerComponent', () => {
  let component: OntologyContainerComponent;
  let fixture: ComponentFixture<OntologyContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

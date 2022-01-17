import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyMainComponent } from './ontology-main.component';

describe('OntologyMainComponent', () => {
  let component: OntologyMainComponent;
  let fixture: ComponentFixture<OntologyMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OntologyMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

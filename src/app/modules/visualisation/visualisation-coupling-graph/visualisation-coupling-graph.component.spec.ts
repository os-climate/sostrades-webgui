import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CouplingGraphComponent } from './visualisation-coupling-graph.component';

describe('CouplingGraphComponent', () => {
  let component: CouplingGraphComponent;
  let fixture: ComponentFixture<CouplingGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CouplingGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CouplingGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

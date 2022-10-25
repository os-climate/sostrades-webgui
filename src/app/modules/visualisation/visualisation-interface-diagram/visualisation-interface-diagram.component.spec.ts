import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualisationInterfaceDiagramComponent } from './visualisation-interface-diagram.component';

describe('VisualisationInterfaceDiagramComponent', () => {
  let component: VisualisationInterfaceDiagramComponent;
  let fixture: ComponentFixture<VisualisationInterfaceDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualisationInterfaceDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualisationInterfaceDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

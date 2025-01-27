import { Component } from '@angular/core';

@Component({
  selector: 'app-visualisation-container',
  templateUrl: './visualisation-container.component.html',
  styleUrls: ['./visualisation-container.component.scss']
})
export class VisualisationContainerComponent  {

  public showCouplingGraphContent: boolean;
  public showExecutionSequenceContent: boolean;
  public showInterfaceDiagramContent: boolean;

  public visualisationsAvailable = 
  [
    { name: 'Interface Diagram', selected: true },
    { name: 'Execution Sequence', selected: false },
    { name: 'Study Coupling Graph', selected: false },
];

  constructor() {
    this.showInterfaceDiagramContent = true;
  }

  onChipClick(visualisationName: string) {
    this.visualisationsAvailable.forEach(viz => {
      if (viz.name === visualisationName) {
        viz.selected = true;
      } else {
        viz.selected = false;
      }
    });

    this.showInterfaceDiagramContent = (visualisationName === 'Interface Diagram' ? true : false);
    this.showCouplingGraphContent = (visualisationName === 'Study Coupling Graph' ? true : false);
    this.showExecutionSequenceContent = (visualisationName === 'Execution Sequence' ? true : false);
  }

}

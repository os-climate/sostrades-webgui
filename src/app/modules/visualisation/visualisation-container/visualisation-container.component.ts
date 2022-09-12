import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visualisation-container',
  templateUrl: './visualisation-container.component.html',
  styleUrls: ['./visualisation-container.component.scss']
})
export class VisualisationContainerComponent implements OnInit {

  public showCouplingGraphContent: boolean;
  public showExecutionSequenceContent: boolean;
  public showInterfaceDiagramContent: boolean;

  public visualisationsAvailable = 
  [
    { name: 'Execution Sequence', selected: true },
    { name: 'Study Coupling Graph', selected: false },
    { name: 'Interface Diagram', selected: false },
];

  constructor() {
    this.showExecutionSequenceContent = true;
  }

  ngOnInit(): void {
  }

  onChipClick(visualisationName: string) {
    this.visualisationsAvailable.forEach(viz => {
      if (viz.name === visualisationName) {
        viz.selected = true;
      } else {
        viz.selected = false;
      }
    });

    this.showCouplingGraphContent = (visualisationName === 'Study Coupling Graph' ? true : false);
    this.showExecutionSequenceContent = (visualisationName === 'Execution Sequence' ? true : false);
    this.showInterfaceDiagramContent = (visualisationName === 'Interface Diagram' ? true : false);
  }

}

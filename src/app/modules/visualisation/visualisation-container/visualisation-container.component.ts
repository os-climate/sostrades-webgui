import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-visualisation-container',
  templateUrl: './visualisation-container.component.html',
  styleUrls: ['./visualisation-container.component.scss']
})
export class VisualisationContainerComponent implements OnInit {

  public showCouplingGraphContent: boolean;
  public showExecutionSequenceContent: boolean;

  public visualisationsAvailable = [{ name: 'Study Coupling Graph', selected: true },
  { name: 'Execution Sequence', selected: false }];

  constructor() {
    this.showCouplingGraphContent = true;
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
  }

}

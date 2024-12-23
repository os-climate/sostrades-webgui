import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { OntologyParameter } from 'src/app/models/ontology-parameter.model';


@Component({
  selector: 'app-custom-tooltip',
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate(300, style({ opacity: 0 })),
      ]),
    ]),
  ],
})


export class CustomTooltipComponent implements OnInit {

  @Input() ontologyKey = '';
  public displayTooltip: boolean;
  public ontologyData: OntologyParameter;

  constructor(private ontologyService: OntologyService) {
    this.displayTooltip = false;
  }

  ngOnInit() {
    this.ontologyData = this.ontologyService.getParameter(this.ontologyKey);
    if (this.ontologyData !== null) {
      this.ontologyData.label = 'Aircraft Name';
      this.ontologyData.definition = 'This is an aircraft, it flies around.';
      this.displayTooltip = true;
    }
  }
}

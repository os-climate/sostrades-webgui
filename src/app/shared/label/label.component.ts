import { Component, OnInit, Input } from '@angular/core';
import { NodeData } from 'src/app/models/node-data.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss']
})

export class LabelComponent implements OnInit {

  @Input() nodeData: NodeData;
  public nodeDataValue: string;

  constructor(private ontologyService: OntologyService) {
    this.nodeDataValue = '';
  }

  ngOnInit() {

    if (this.nodeData.value !== null && this.nodeData.value !== undefined) {
      if (this.nodeData.value.toString().length > 0) {
        this.nodeDataValue = this.nodeData.value.toString();
      } else {
        this.nodeDataValue = 'No value';
      }
    } else {
      this.nodeDataValue = 'No value';
    }
  }


}

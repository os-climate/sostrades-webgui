import { Component, Input } from '@angular/core';
import { NodeData } from 'src/app/models/node-data.model';

@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html',
  styleUrls: ['./widget-container.component.scss']
})
export class WidgetContainerComponent {

  @Input() nodeDataList: NodeData[];
  @Input() namespace: string;
  @Input() discipline: string;

  public objectKey = Object.keys;

}

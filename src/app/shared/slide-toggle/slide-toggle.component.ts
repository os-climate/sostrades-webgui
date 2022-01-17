import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { NodeData, ValueType } from 'src/app/models/node-data.model';

@Component({
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss']
})
export class SlideToggleComponent implements OnInit {

  @Input() nodeData: NodeData;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();
  public toggleActivated: boolean;

  constructor() {
    this.toggleActivated = true;
  }

  ngOnInit(): void {
    if (this.nodeData.valueType === ValueType.READ_ONLY) {
      this.toggleActivated = false;
    }
  }

  onInputChange(value) {
    this.valueChanged.emit(value);
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData, ValueType } from 'src/app/models/node-data.model';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {

  @Input() nodeData: NodeData;

  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  public displayName: string;
  public multiple: boolean;
  public isDisabled: boolean;

  // Timer use to send new value to server and avoid callback to be trigger on each key press
  private timer;

  constructor() {
    this.isDisabled = false;
  }

  ngOnInit(): void {
    this.multiple = this.nodeData.type.includes('list');

    if (this.nodeData.valueType === ValueType.READ_ONLY) {
      this.isDisabled = true;
      if (this.nodeData.value === '' || this.nodeData.value === undefined || this.nodeData.value === null) {
        this.nodeData.value = 'No value yet';
      }
    }
  }

  onSelectChange() {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      this.sendNewValues();
    });
  }

  sendNewValues() {
    if (this.nodeData.type.includes('list')) { // Case list with multiple selection
      if (this.nodeData.type.includes('float')) {
        const newDataArray = [];
        this.nodeData.value.forEach(element => {
          newDataArray.push(parseFloat(element));
        });
        this.valueChanged.emit(newDataArray);
      } else if (this.nodeData.type.includes('int')) {
        const newDataArray = [];
        this.nodeData.value.forEach(element => {
          // tslint:disable-next-line: radix
          newDataArray.push(parseInt(element));
        });
        this.valueChanged.emit(newDataArray);
      } else {
        this.valueChanged.emit(this.nodeData.value);
      }
    } else { // One value selectable
      if (this.nodeData.type.includes('float')) {
        this.valueChanged.emit(parseFloat(this.nodeData.value));
      } else if (this.nodeData.type.includes('int')) {
        // tslint:disable-next-line: radix
        this.valueChanged.emit(parseInt(this.nodeData.value));
      } else {
        this.valueChanged.emit(this.nodeData.value);
      }
    }

  }
}

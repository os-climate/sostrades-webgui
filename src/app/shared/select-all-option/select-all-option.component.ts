import { Component, Input, Output } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-all-option',
  templateUrl: './select-all-option.component.html',
  styleUrls: ['./select-all-option.component.scss']
})
export class SelectAllOptionComponent {

  @Input() model: NgModel;
  @Input() values = [];
  @Input() text = 'Select All';
  @Output() changeEvent = new EventEmitter<boolean>();


  isChecked(): boolean {
    return this.model.value && this.values.length
      && this.model.value.length === this.values.length;
  }

  isIndeterminate(): boolean {
    return this.model.value && this.values.length && this.model.value.length
      && this.model.value.length < this.values.length;
  }

  toggleSelection(change: MatCheckboxChange): void {
    if (change.checked) {
      this.model.update.emit(this.values);
      this.changeEvent.emit(true);
    } else {
      this.model.update.emit([]);
      this.changeEvent.emit(true);
    }
  }
}

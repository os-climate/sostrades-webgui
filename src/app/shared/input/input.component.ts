import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { NodeData, ValueType } from 'src/app/models/node-data.model';
import { ErrorStateMatcher } from '@angular/material/core';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { ScientificNotationPipe } from 'src/app/pipes/scientific-notation/scientific-notation.pipe';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';


export class InputErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input() nodeData: NodeData;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  public placeholderDict = new Map<string, string>();
  public placeholder: string;
  public displayName: string;
  public inputFormControl: FormControl;
  matcher = new InputErrorStateMatcher();

  public innerValue: any;

  // Timer use to send new value to server and avoid callback to be trigger on each key press
  private timer;

  constructor(private ontologyService: OntologyService) {
    this.timer = null;
    this.placeholder = 'Enter a value';
    this.placeholderDict.clear();
  }

  ngOnInit(): void {

    // Fill placeholder with the type of the nodeData
    if (this.nodeData.type !== null && this.nodeData.type !== undefined) {
      switch (this.nodeData.type) {
        case 'int':
          this.placeholderDict.set(this.nodeData.type, `Enter an "${this.nodeData.type}" value`);
          break;
        default:
          this.placeholderDict.set(this.nodeData.type, `Enter a "${this.nodeData.type}" value`);
      }
      this.placeholder = this.placeholderDict.get(this.nodeData.type);
    }

    // List of validators needed
    const validators = [];
    validators.push(Validators.required);

    // Validator if range specified
    if (this.nodeData.range !== undefined && this.nodeData.range !== null) {
      if (this.nodeData.range !== 'None') {
        validators.push(Validators.min(this.nodeData.range[0]));
        validators.push(Validators.max(this.nodeData.range[1]));
      }
    }

    if (this.nodeData.type === 'float') {
      validators.push(Validators.pattern(TypeCheckingTools.FLOAT_SCIENTIFIC_REGEX));
    }
    if (this.nodeData.type === 'int') {
      validators.push(Validators.pattern(TypeCheckingTools.INTEGER_REGEX));
    }

    if (this.nodeData.type === 'float') {
      this.innerValue = new ScientificNotationPipe().transform(this.nodeData.value);
    } else {
      this.innerValue = this.nodeData.value;
    }

    this.inputFormControl = new FormControl(this.innerValue, validators);

    if (this.nodeData.valueType === ValueType.READ_ONLY) {
      this.inputFormControl.disable();
      if (this.nodeData.value === '' || this.nodeData.value === undefined || this.nodeData.value === null) {
        this.nodeData.value = 'No value yet';
      }
    }
  }

  onInputChange(value) {

    if (this.inputFormControl && this.inputFormControl.valid) {
      if (this.nodeData.type === 'float') {
        const cleanedValue = value.toString().replace(',', '.');
        this.nodeData.value = cleanedValue;
      } else {
        this.nodeData.value = value;
      }
    }
  }

  onBlur(event) {
    let emitChange = false;

    if (this.inputFormControl && this.inputFormControl.valid) {

      if (this.nodeData.value === null || this.innerValue === null) {
        emitChange = true;
      } else if (this.nodeData.value.toString() !== this.innerValue.toString()) {
        emitChange = true;
      }

      if (emitChange) {
        if (this.nodeData.type === 'int') {
          this.valueChanged.emit(Number(this.nodeData.value));
        } else if (this.nodeData.type === 'float') {
          this.valueChanged.emit(Number(this.nodeData.value));

        } else {
          this.valueChanged.emit(this.nodeData.value);
        }
      }
    }
    if (this.nodeData.type === 'float') {
      this.innerValue = new ScientificNotationPipe().transform(this.nodeData.value);
    } else {
      this.innerValue = this.nodeData.value;
    }

  }

  onFocus(event) {
    this.innerValue = this.nodeData.value;
  }
}

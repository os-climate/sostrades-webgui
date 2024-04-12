import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NodeData, ValueType } from 'src/app/models/node-data.model';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { Subscription } from 'rxjs';
import { ScientificNotationPipe } from 'src/app/pipes/scientific-notation/scientific-notation.pipe';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

export class InputErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  @Input() nodeData: NodeData;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  public displayUnit: string;
  public displayedColumns: string[];
  public dataSource: MatTableDataSource<any>; // Value or Key Value
  public inputFormControl: FormControl;
  public dataArray = [];
  public dataDict = [];
  public addKey: string;
  public addValue: string;
  public isReadOnlyWidget: boolean;
  private timer;
  matcher = new InputErrorStateMatcher();
  private onNodeDataChangeSubscription: Subscription;

  constructor(
    private studyCaseLocalStorageService: StudyCaseLocalStorageService) {
    this.timer = null;
    this.isReadOnlyWidget = false;
  }

  ngOnInit(): void {
    this.addKey = '';
    this.addValue = '';

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

    if (this.nodeData.type.includes('float')) {
      validators.push(Validators.pattern(TypeCheckingTools.FLOAT_SCIENTIFIC_REGEX));
    }
    if (this.nodeData.type.includes('int')) {
      validators.push(Validators.pattern(TypeCheckingTools.INTEGER_REGEX));
    }
    this.inputFormControl = new FormControl('', validators);

    if (this.nodeData.valueType === ValueType.READ_ONLY) {
      this.isReadOnlyWidget = true;
      this.inputFormControl.disable();
      if (this.nodeData.value === '' || this.nodeData.value === undefined || this.nodeData.value === null) {
        this.nodeData.value = ['No value yet'];
      }
    }

    this.displayedColumns = ['value', 'delete'];
    if (this.nodeData.value !== null) {
      this.nodeData.value.forEach(element => {
        this.dataArray.push(element);
      });
    }

    this.dataSource = new MatTableDataSource(this.convertToScientificNotation(this.dataArray));

    this.onNodeDataChangeSubscription = this.studyCaseLocalStorageService.onNodeDataChange.subscribe(identifier => {
      if (this.nodeData.identifier === identifier) {
        if (this.nodeData.value !== null) {
          this.dataArray = [];
          this.nodeData.value.forEach(element => {
            this.dataArray.push(element);
          });
        }
        this.dataSource = new MatTableDataSource(this.convertToScientificNotation(this.dataArray));
      }
    });
  }

  ngOnDestroy() {
    if (this.onNodeDataChangeSubscription !== null) {
      this.onNodeDataChangeSubscription.unsubscribe();
      this.onNodeDataChangeSubscription = null;
    }
  }

  addRow() {
    this.dataArray.push(this.addValue);
    this.inputFormControl.reset();
    this.dataSource = new MatTableDataSource(this.convertToScientificNotation(this.dataArray));
    this.sendNewValues();
  }

  deleteRow(index: number) {
    this.dataArray.splice(index, 1);
    this.dataSource = new MatTableDataSource(this.dataArray);
    this.sendNewValues();
  }

  onInputChange(value, index) {
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.nodeData.type.includes('float')) {
      let cleanedValue = value.toString().replace(',', '.');
      this.dataArray[index] = cleanedValue;
    } else {
      this.dataArray[index] = value;
    }

    this.timer = setTimeout(() => {
      this.sendNewValues();
    }, 500);
  }

  onBlur(event, index) {
    event.target.value = new ScientificNotationPipe().transform(this.dataArray[index]);
  }

  onFocus(event, index) {
    event.target.value = this.dataArray[index];
  }

  sendNewValues() {
    if (this.nodeData.type.includes('float')) {
      const newDataArray = [];
      this.dataArray.forEach(element => {
        newDataArray.push(parseFloat(element));
      });
      this.valueChanged.emit(newDataArray);
    } else if (this.nodeData.type.includes('int')) {
      const newDataArray = [];
      this.dataArray.forEach(element => {
        // eslint-disable-next-line radix
        newDataArray.push(parseInt(element));
      });
      this.valueChanged.emit(newDataArray);
    } else {
      this.valueChanged.emit(this.dataArray);
    }
  }

  private convertToScientificNotation(inputValues: any[]): any[] {
    const buffer = [];

    if (this.nodeData.type.includes('float')) {
      inputValues.forEach(value => {
        buffer.push(new ScientificNotationPipe().transform(value));
      });
    } else {
      inputValues.forEach(value => {
        buffer.push(value);
      });
    }

    return buffer;
  }
}

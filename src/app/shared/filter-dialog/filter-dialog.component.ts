import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit, OnDestroy {


  public isLoading: boolean;
  public disableForm: boolean;
  public research: any;

  /** control for the selected bank for multi-selection */
  public researchMultiCtrl: FormControl ;
  /** control for the MatSelect filter keyword multi-selection */
  public researchFilteredMultiCtrl: FormControl;
  /** list of banks filtered by search keyword */
  public filteredResearchMulti: ReplaySubject<string[]> = new ReplaySubject<[]>(1);

  /** flags to set the toggle all checkbox state */
  isIndeterminate = false;
  isChecked = false;

  protected filteredResearchCache: string[];
  protected onDestroy = new Subject<void>();


  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;


  constructor(
    public dialogRef: MatDialogRef<FilterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public datas) {
    this.researchMultiCtrl = new FormControl();
    this.researchFilteredMultiCtrl  = new FormControl();
    this.filteredResearchCache = datas.possibleStringValues;
   }

  ngOnInit(): void {

    this.datas.columnName = this.formatColumnName(this.datas.columnName)
 
    // load the initial process list
    this.filteredResearchMulti.next(this.datas.possibleStringValues.slice());

    // listen for search field value changes
    this.researchFilteredMultiCtrl.valueChanges.pipe(takeUntil(this.onDestroy))
    .subscribe(() => {
      this._filter();
      this.setToggleAllCheckboxState();
    });

     // listen for search field value changes
    this.researchMultiCtrl.valueChanges.pipe(takeUntil(this.onDestroy))
    .subscribe(() => {
      this.setToggleAllCheckboxState();
    });

    // set selection
    if (this.datas.selectedStringValues !== null && this.datas.selectedStringValues !== undefined) {
        if (this.datas.selectedStringValues.length > 0) {
          this.researchMultiCtrl.setValue(this.datas.selectedStringValues);
        }
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
  public onDataChange(event: any) {
    this.research = this.datas.possibleStringValues.find(x => x === event);

  }

  toggleSelectAll(selectAllValue: boolean) {
    this.filteredResearchMulti.pipe(take(1), takeUntil(this.onDestroy))
      .subscribe(val => {
        if (selectAllValue) {
          this.researchMultiCtrl.patchValue(val);
        } else {
          this.researchMultiCtrl.patchValue([]);
        }
      });
  }

  protected _filter() {
    if (!this.datas) {
      return;
    }
    // get the search keyword
    let search = this.researchFilteredMultiCtrl.value;
    if (!search) {
      this.filteredResearchCache = this.datas.possibleStringValues.slice();
      this.filteredResearchMulti.next( this.filteredResearchCache);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter datas
    this.filteredResearchCache = this.datas.possibleStringValues.filter(data => data.toLowerCase().indexOf(search) > -1);
    this.filteredResearchMulti.next(this.filteredResearchCache);
  }

  protected setToggleAllCheckboxState() {
    let filteredLength = 0;
    if (this.researchMultiCtrl && this.researchMultiCtrl.value) {
      this.filteredResearchCache.forEach(el => {
        if (this.researchMultiCtrl.value.indexOf(el) > -1) {
          filteredLength++;
        }
      });
      this.isIndeterminate = filteredLength > 0 && filteredLength < this.filteredResearchCache.length;
      this.isChecked = filteredLength > 0 && filteredLength === this.filteredResearchCache.length;
    }
  }

public formatColumnName(columnName: string): string {
    // If the word is empty, return an empty string
    if (!columnName.trim()) {
        return '';
    }

    // Capitalize the first letter
    let formattedColumnName = columnName.charAt(0).toUpperCase() + columnName.slice(1);

     // Add a space before each uppercase letter, except the first one
    for (let i = 1; i < formattedColumnName.length; i++) {
        if (formattedColumnName.charAt(i) === formattedColumnName.charAt(i).toUpperCase()) {
            formattedColumnName = formattedColumnName.slice(0, i) + ' ' + formattedColumnName.slice(i);
            i++; // Move the cursor by one step to skip the added space
        }
    }

    return formattedColumnName;
}

  submitForm() {
    this.datas.cancel = false;
    this.datas.possibleStringValues = this.datas.possibleStringValues;
    this.datas.selectedStringValues = this.researchMultiCtrl.value;
    this.dialogRef.close(this.datas);
  }

  cancelClick() {
    this.datas.cancel = true;
    this.dialogRef.close(this.datas);
  }

}

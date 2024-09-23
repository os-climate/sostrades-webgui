import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseAllocationStatus } from 'src/app/models/study-case-allocation.model';
import { LoadStatus } from 'src/app/models/study.model';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.scss']
})
export class LoadingDialogComponent implements OnInit {

  private _message: string;
  private _showCancelButton: boolean;
  public _disableCancelLoading: boolean;
  public _status: StudyCaseAllocationStatus | LoadStatus;
  steps = [
    { label: 'Pod creation', status: 0 },
    { label: 'Study server loading', status: 0 },
    { label: 'Study Loaded', status: 0 },
  ];

  constructor(
    public dialogRef: MatDialogRef<LoadingDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingDialogData,
  ) {
  }

  ngOnInit(): void {
    this._message = this.data.message;
    this._showCancelButton = this.data.showCancelButton;
    this._disableCancelLoading = false;
    this._status = this.data.status;
  }

  set message(value: string) {
    if (value !== this._message) {
      this._message = value;
    }
  }

  get message() {
    return this._message;
  }

  set showCancelButton(value: boolean) {
    if (value !== this._showCancelButton) {
      this._showCancelButton = value;
    }
  }

  get showCancelButton() {
    return this._showCancelButton;
  }

  set disableCancelLoading(value: boolean) {
    if (value !== this._disableCancelLoading) {
      this._disableCancelLoading = value;
    }
  }

  get disableCancelLoading() {
    return this._disableCancelLoading;
  }

  set status(value: StudyCaseAllocationStatus | LoadStatus) {
      this._status = value;
      this.updateStepsStatus();
  }

  get status() {
    return this._status;
  }

  private updateStepsStatus() {
      switch (this.status) {
        case StudyCaseAllocationStatus.NOT_STARTED:
          this.steps[0].status = 1; // gray
          break;
        case StudyCaseAllocationStatus.PENDING:
          this.steps[0].status = 2; // blue
          break;
        case LoadStatus.IN_PROGESS:
          this.steps[0].status = 3; // green
          this.steps[1].status = 2; // blue
          break;
        case LoadStatus.LOADED:
          this.steps[0].status = 3; // green
          this.steps[1].status = 3; // green
          this.steps[2].status = 3; // green
          break;
      }
    }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

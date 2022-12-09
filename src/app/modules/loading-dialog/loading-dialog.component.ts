import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoadingDialogData } from 'src/app/models/dialog-data.model';

@Component({
  selector: 'app-loading-dialog',
  templateUrl: './loading-dialog.component.html',
  styleUrls: ['./loading-dialog.component.scss']
})
export class LoadingDialogComponent implements OnInit {

  private _message: string;
  private _showCancelButton: boolean;
  private _cancelEvent = new EventEmitter<void>();
  public _disableCancelLoading: boolean;

  constructor(
    public dialogRef: MatDialogRef<LoadingDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingDialogData,
  ) {
  }

  ngOnInit(): void {
    this._message = this.data.message;
    this._showCancelButton = this.data.showCancelButton;
    this._disableCancelLoading = false;
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

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

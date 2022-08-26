import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from 'src/app/modules/loading-dialog/loading-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingDialogService {

  private dialogRef: MatDialogRef<LoadingDialogComponent>;

  constructor(private dialog: MatDialog) {
    this.dialogRef = null;
   }

  showLoading(message: string) {
    if (this.dialog === null) {
      this.closeLoading();
    }
    this.dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      width: '500px',
      height: '220px',
      data: message
    });
  }
  isLoadingOpen() {
  return this.dialogRef !== null;
  }

  updateMessage(message: string) {
    if (this.dialogRef === null) {
      this.showLoading(message);
    } else {
      this.dialogRef.componentInstance.message = message;
    }
  }

  closeLoading() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

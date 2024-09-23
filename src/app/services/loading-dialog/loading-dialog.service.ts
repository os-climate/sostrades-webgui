import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { LoadingDialogData } from "src/app/models/dialog-data.model";
import { StudyCaseAllocationStatus } from "src/app/models/study-case-allocation.model";
import { LoadStatus } from "src/app/models/study.model";
import { LoadingDialogComponent } from "src/app/modules/loading-dialog/loading-dialog.component";

@Injectable({
  providedIn: "root",
})
export class LoadingDialogService {
  private dialogRef: MatDialogRef<LoadingDialogComponent>;

  constructor(private dialog: MatDialog) {
    this.dialogRef = null;
  }

  showLoadingWithCancelobserver(message: string): Observable<boolean> {
    const cancelObservable = new Observable<boolean>((cancelObserver) => {
      this.showLoading(message, true);

      this.dialogRef.afterClosed().subscribe((data) => {
        // Check if the dialog has been closed by canceling
        if (data !== undefined && data !== null && data.cancel) {
          cancelObserver.next(true);
        }
      });
    });

    return cancelObservable;
  }

  showLoading(message: string, showCancelButton?: boolean) {
    if (showCancelButton === null || showCancelButton === undefined) {
      showCancelButton = false;
    }

    if (this.dialog === null) {
      this.closeLoading();
    }

    const loadingDialogData = new LoadingDialogData();
    loadingDialogData.message = message;
    loadingDialogData.showCancelButton = showCancelButton;
    loadingDialogData.status = StudyCaseAllocationStatus.NOT_STARTED

    this.dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
      width: "500px",
      height: "220px",
      data: loadingDialogData,
    });
  }

  isLoadingOpen() {
    return this.dialogRef !== null;
  }

  updateMessage(message: string) {
    if (
      this.dialogRef !== null &&
      this.dialogRef !== undefined &&
      this.dialogRef.componentInstance !== null &&
      this.dialogRef.componentInstance !== undefined
    ) {
      this.dialogRef.componentInstance.message = message;
    }
  }

  updateStatus(status: StudyCaseAllocationStatus | LoadStatus) {
    if (
      this.dialogRef !== null &&
      this.dialogRef !== undefined &&
      this.dialogRef.componentInstance !== null &&
      this.dialogRef.componentInstance !== undefined
    ) {
      this.dialogRef.componentInstance.status = status;
    }
  }

  disableCancelLoading(enable: boolean) {
    if (
      this.dialogRef !== null &&
      this.dialogRef !== undefined &&
      this.dialogRef.componentInstance !== null &&
      this.dialogRef.componentInstance !== undefined
    ) {
      this.dialogRef.componentInstance.disableCancelLoading = enable;
    }
  }

  closeLoading() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

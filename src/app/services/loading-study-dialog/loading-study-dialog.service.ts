import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { LoadingStudyDialogData } from 'src/app/models/dialog-data.model';
import { LoadingDialogStep } from 'src/app/models/loading-study-dialog.model';
import { LoadingStudyDialogComponent } from 'src/app/modules/loading-study-dialog/loading-study-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingStudyDialogService {
  private dialogRef: MatDialogRef<LoadingStudyDialogComponent>;
  
  constructor(private dialog: MatDialog) {
    this.dialogRef = null;
  }

  showLoadingWithCancelobserver(title: string): Observable<boolean> {
    const cancelObservable = new Observable<boolean>((cancelObserver) => {
      this.showLoading(title);

      this.dialogRef.afterClosed().subscribe((data) => {
        // Check if the dialog has been closed by canceling
        if (data !== undefined && data !== null && data.cancel) {
          cancelObserver.next(true);
        }
      });
    });

    return cancelObservable;
  }

  setError(error:string){
    this.dialogRef.componentInstance.setError(error);
  }

  showLoading(title: string) {
    if (this.dialog === null) {
      this.closeLoading();
    }

    const loadingDialogData = new LoadingStudyDialogData();
    loadingDialogData.title = title;

    this.dialogRef = this.dialog.open(LoadingStudyDialogComponent, {
      disableClose: true,
      width: "500px",
      height: "220px",
      data: loadingDialogData,
    });
  }

  isLoadingOpen() {
    return this.dialogRef !== null;
  }

  updateStep(step: LoadingDialogStep) {
    if (
      this.dialogRef !== null &&
      this.dialogRef !== undefined &&
      this.dialogRef.componentInstance !== null &&
      this.dialogRef.componentInstance !== undefined
    ) {
      this.dialogRef.componentInstance.updateCurrentStep(step);
    }
  }

  
  closeLoading() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

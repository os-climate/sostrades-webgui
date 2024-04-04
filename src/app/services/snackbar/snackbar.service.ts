import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../shared/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  private openSnackBar(messageTypeStyle: string, message: string, action: string, duration: number) {

    this.snackBar.openFromComponent(SnackbarComponent, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: messageTypeStyle,
      data: { message, messageTypeStyle, action }
    });
  }

  showError(message: string) {
    this.openSnackBar(SnackBarTypes.ERROR, message, 'X', 0);
  }

  showInformation(message: string) {
    this.openSnackBar(SnackBarTypes.INFORMATIONN, message, '', 3000);
  }

  showWarning(message: string) {
    this.openSnackBar(SnackBarTypes.WARNING, message, '', 5000);
  }

  closeSnackbarIfOpened() {
    this.snackBar.dismiss();
  }

}

export enum SnackBarTypes { // Implemented in styles.scss
  ERROR = 'snackBarError',
  INFORMATIONN = 'snackBarInformation',
  WARNING = 'snackBarWarning',
}

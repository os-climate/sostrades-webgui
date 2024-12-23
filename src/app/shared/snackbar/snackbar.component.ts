import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent {

  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) { }


  public getIcon(): string {
    switch (this.data.messageTypeStyle) {
      case 'snackBarError':
        return 'fas fa-exclamation-circle fa-fw';
      case 'snackBarInformation':
        return 'fas fa-info-circle fa-fw';
      case 'snackBarWarning':
        return 'fas fa-exclamation-triangle fa-fw';
    }
  }
}

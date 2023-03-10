import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ValidationDialogData } from 'src/app/models/dialog-data.model';

@Component({
  selector: 'app-validation-dialog',
  templateUrl: './validation-dialog.component.html',
  styleUrls: ['./validation-dialog.component.scss']
})
export class ValidationDialogComponent implements OnInit {

  public validationTitle: string;
  public showSupButton: boolean;
  public showCancelButton: boolean;

  constructor(
    public dialogRef: MatDialogRef<ValidationDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: ValidationDialogData) {
    this.showSupButton = false;
    this.showCancelButton = true;
    this.validationTitle = 'Are you sure ?';
  }

  ngOnInit(): void {
    if (this.data.buttonSecondaryActionText !== null) {
      this.showSupButton = true;
    }

    this.showCancelButton = this.data.showCancelButton;

    if (this.data.title !== null && this.data.title !== undefined && this.data.title.length > 0) {
      this.validationTitle = this.data.title;
    }
  }

  onOkClick() {
    this.data.cancel = false;
    this.data.validate = true;
    this.dialogRef.close(this.data);
  }

  onSupClick() {
    if (this.data.secondaryActionConfirmationNeeded) {
      const validationDialogData = new ValidationDialogData();
      validationDialogData.message = `Are you sure you want to delete all the changes you made ?`;

      const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
        disableClose: true,
        width: '500px',
        height: '220px',
        data: validationDialogData
      });

      dialogRefValidate.afterClosed().subscribe(result => {
        const validationData: ValidationDialogData = result as ValidationDialogData;

        if ((validationData !== null) && (validationData !== undefined)) {
          if (validationData.cancel !== true) {
            this.data.cancel = false;
            this.data.validate = false;
            this.dialogRef.close(this.data);
          }
        }
      });
    } else {
      this.data.cancel = false;
      this.data.validate = false;
      this.dialogRef.close(this.data);
    }
  }

  onCancelClick(): void {
    this.data.cancel = true;
    this.data.validate = false;
    this.dialogRef.close(this.data);
  }

}

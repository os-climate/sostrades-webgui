import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-study-case-execution-exception-dialog',
  templateUrl: './study-case-execution-exception-dialog.component.html',
  styleUrls: ['./study-case-execution-exception-dialog.component.scss']
})
export class StudyCaseExecutionExceptionDialogComponent {

  constructor(public dialogRef: MatDialogRef<StudyCaseExecutionExceptionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public message: string) {
  }


  close() {
    this.dialogRef.close();
  }

}

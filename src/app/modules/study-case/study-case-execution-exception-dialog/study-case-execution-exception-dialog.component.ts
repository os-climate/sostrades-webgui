import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-study-case-execution-exception-dialog',
  templateUrl: './study-case-execution-exception-dialog.component.html',
  styleUrls: ['./study-case-execution-exception-dialog.component.scss']
})
export class StudyCaseExecutionExceptionDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<StudyCaseExecutionExceptionDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public message: string) {
  }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

}

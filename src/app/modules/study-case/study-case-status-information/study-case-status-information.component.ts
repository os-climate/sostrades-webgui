import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-study-case-status-information',
  templateUrl: './study-case-status-information.component.html',
  styleUrls: ['./study-case-status-information.component.scss']
})
export class StudyCaseStatusInformationComponent {

  constructor(public dialogRef: MatDialogRef<StudyCaseStatusInformationComponent>) { }

  okClick() {
    this.dialogRef.close();
  }

}

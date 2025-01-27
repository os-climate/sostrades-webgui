import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudyLink } from 'src/app/models/dialog-data.model';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-study-case-link-information',
  templateUrl: './study-case-link-information.component.html',
  styleUrls: ['./study-case-link-information.component.scss']
})
export class StudyCaseLinkInformationComponent {

  constructor(
    private clipboard: Clipboard,
    @Inject(MAT_DIALOG_DATA) public data: StudyLink,
    public dialogRef: MatDialogRef<StudyCaseLinkInformationComponent>,
  ) {
  }

  copyLink() {
    this.clipboard.copy(this.data.htmlLink);
  }

  okClick(): void {
    this.dialogRef.close();
  }
}

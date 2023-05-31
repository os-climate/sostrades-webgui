import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StudyLink } from 'src/app/models/dialog-data.model';
import { Study } from 'src/app/models/study.model';
import { StudyCaseLinkInformationComponent } from 'src/app/modules/study-case/study-case-link-information/study-case-link-information.component';

@Injectable({
  providedIn: 'root'
})
export class StudyDialogService {

  private dialogRef: MatDialogRef<StudyCaseLinkInformationComponent>;


  constructor(private dialog: MatDialog) { }

  showAccessLink(study: Study) {
    const studyLinkDialogData = new StudyLink();
    studyLinkDialogData.studyName = study.name;
    studyLinkDialogData.htmlLink = `${window.location.origin}/study/${study.id}`;

    this.dialogRef = this.dialog.open(StudyCaseLinkInformationComponent, {
      disableClose: false,
      data: studyLinkDialogData,
    });
  }

  closeAccessLink() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

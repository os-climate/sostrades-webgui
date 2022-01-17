import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoeditionDialogData } from 'src/app/models/dialog-data.model';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-coedition-dialog',
  templateUrl: './study-case-notifications-changes-dialog.component.html',
  styleUrls: ['./study-case-notifications-changes-dialog.component.scss']
})
export class StudyCaseNotificationsChangesDialogComponent implements OnInit {

  public displayedColumns = ['name', 'oldValue', 'newValue'];
  public dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>();

  constructor(
    public dialogRef: MatDialogRef<StudyCaseNotificationsChangesDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: CoeditionDialogData
  ) { }

  ngOnInit(): void {
    if (this.data.changes !== []) {
      this.data.changes.forEach(change => {
        if (change.changeType === UpdateParameterType.CSV) {
          change.newValue = 'Csv';
          change.oldValue = 'Csv';
        }
      });
      this.dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>(this.data.changes);
    }
  }

  onOkClick() {
    this.dialogRef.close();
  }
}

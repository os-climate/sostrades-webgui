import { Component, OnInit, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StudyCaseModificationDialogData } from 'src/app/models/dialog-data.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { CoeditionType } from 'src/app/models/coedition-notification.model';

@Component({
  selector: 'app-study-case-modification-dialog',
  templateUrl: './study-case-modification-dialog.component.html',
  styleUrls: ['./study-case-modification-dialog.component.scss']
})
export class StudyCaseModificationDialogComponent implements OnInit, OnDestroy {

  public displayedColumns = ['name', 'oldValue', 'newValue', 'selected'];
  public dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>();
  public selection = new SelectionModel<StudyUpdateParameter>(true, []);
  public selectedRowCount: number;
  public buttonSaveText: string;
  private onNewNotificationSubscription: Subscription;

  @ViewChild(MatSort, { static: false })
  set sort(v: MatSort) {
    this.dataSourceChanges.sort = v;
  }

  constructor(
    private socketService: SocketService,
    public dialogRef: MatDialogRef<StudyCaseModificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudyCaseModificationDialogData
  ) {
    this.onNewNotificationSubscription = null;
    this.buttonSaveText = '';
  }

  ngOnInit(): void {

    this.dataSourceChanges = new MatTableDataSource<StudyUpdateParameter>(this.data.changes);
    this.dataSourceChanges.sortingDataAccessor = (item, property) => {
      return typeof item[property] === 'string' ? item[property].toLowerCase() : item[property];
    };
    this.dataSourceChanges.sort = this.sort;
    this.dataSourceChanges.data.forEach(row => this.selection.select(row));

    this.onNewNotificationSubscription = this.socketService.onNewNotification.subscribe(notification => {
      if (notification.type === CoeditionType.SUBMISSION || notification.type === CoeditionType.EXECUTION) {
        this.onCancelClick();
      }
    });

    if (this.data.withRun) {
      this.buttonSaveText = 'Save & Run';
    } else {
      this.buttonSaveText = 'Save & Synchronise';
    }
  }

  ngOnDestroy() {
    if (this.onNewNotificationSubscription !== null) {
      this.onNewNotificationSubscription.unsubscribe();
      this.onNewNotificationSubscription = null;
    }
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSourceChanges.data.forEach(row => this.selection.select(row));
  }

  updateSelectedCount() {
    if (this.selection.selected.length > 0) {
      this.selectedRowCount = this.selection.selected.length;
    } else {
      this.selectedRowCount = 0;
    }
  }

  allSelectedChange() {
    this.masterToggle();
    this.updateSelectedCount();
  }

  singleRowSelectedChange(row) {
    this.selection.toggle(row);
    this.updateSelectedCount();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceChanges.data.length;
    return numSelected === numRows;
  }

  onOkClick() {
    this.data.cancel = false;
    this.data.changes = this.selection.selected;
    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

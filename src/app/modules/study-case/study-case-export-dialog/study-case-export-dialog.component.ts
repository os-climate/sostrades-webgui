import { Component, OnInit, Inject, OnDestroy, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExecutionDialogData } from 'src/app/models/dialog-data.model';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';
import { ProgressStatus } from 'src/app/models/progress-status.model';

@Component({
  selector: 'app-study-case-export-dialog',
  templateUrl: './study-case-export-dialog.component.html',
  styleUrls: ['./study-case-export-dialog.component.scss']
})
export class StudyCaseExportDialogComponent implements OnInit, OnDestroy {

  public onDownload: EventEmitter<void> = new EventEmitter();
  public onReload: EventEmitter<void> = new EventEmitter();
  public isInError: boolean;
  public isFinished: boolean;
  public errorMessage: string;

  constructor(
    public dialogRef: MatDialogRef<StudyCaseExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProgressStatus) {
      this.isInError = false;
      this.errorMessage = "";
      this.isFinished = false;
     }


  ngOnInit(): void {
    this.isInError = this.data.isInError;
    this.errorMessage = this.data.errorMessage;
    this.isFinished = this.data.isFinished;
  }

  ngOnDestroy() {
    if (this.onDownload !== null) {
      this.onDownload.unsubscribe();
      this.onDownload = null;
    }
    if (this.onReload !== null) {
      this.onReload.unsubscribe();
      this.onReload = null;
    }
  }
}

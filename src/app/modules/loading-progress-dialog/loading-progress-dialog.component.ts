import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadingProgressDialogData, LoadingStudyDialogData } from 'src/app/models/dialog-data.model';
import { DEFAULT_DIALOG_STEPS, LoadingDialogStep, READONLY_DIALOG_STEPS } from 'src/app/models/loading-study-dialog.model';
import { ProgressStatus } from 'src/app/models/progress-status.model';

@Component({
  selector: 'app-loading-progress-dialog',
  templateUrl: './loading-progress-dialog.component.html',
  styleUrls: ['./loading-progress-dialog.component.scss']
})
export class LoadingProgressDialogComponent implements OnInit {
  
  public progress: number;
  public buffer:number;
  public title:string;
  public progressText: string;
  public onUpdateProgress: EventEmitter<ProgressStatus>= new EventEmitter();
  
  constructor(
    public dialogRef: MatDialogRef<LoadingProgressDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: LoadingProgressDialogData,
  ) {
    
  }

  ngOnInit(): void {
    this.progress = this.data.progress;
    this.buffer = this.data.nextProgress;
    this.title = this.data.title;
    this.progressText = "";
    this.onUpdateProgress.subscribe(progress=> {
      this.progress = progress.progress;
      this.buffer = progress.nextProgress;
      this.progressText = progress.progressText;
    }

    )
  }

  ngOnDestroy(): void {
    if (this.onUpdateProgress !== null) {
      this.onUpdateProgress.unsubscribe();
      this.onUpdateProgress = null;
    }
  }

  onCloseClick() {
    this.dialogRef.close(this.data);
    this.dialogRef = null;
  }
}



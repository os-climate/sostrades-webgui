import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExecutionDialogData } from 'src/app/models/dialog-data.model';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket/socket.service';

@Component({
  selector: 'app-study-case-execution-dialog',
  templateUrl: './study-case-execution-dialog.component.html',
  styleUrls: ['./study-case-execution-dialog.component.scss']
})
export class StudyCaseExecutionDialogComponent implements OnInit, OnDestroy {

  public onStudySubmissionEndSubscription: Subscription;

  constructor(
    private socketService: SocketService,
    public dialogRef: MatDialogRef<StudyCaseExecutionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExecutionDialogData) { }


  ngOnInit(): void {
    this.onStudySubmissionEndSubscription = this.socketService.onStudySubmissionEnd.subscribe(() => {
      this.dialogRef.close();
    });

  }

  ngOnDestroy() {
    if (this.onStudySubmissionEndSubscription !== null) {
      this.onStudySubmissionEndSubscription.unsubscribe();
      this.onStudySubmissionEndSubscription = null;
    }
  }
}

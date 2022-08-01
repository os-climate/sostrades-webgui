import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { RepositoryTraceabilityDialogData } from 'src/app/models/dialog-data.model';

@Component({
  selector: 'app-repository-traceability-dialog',
  templateUrl: './repository-traceability-dialog.component.html',
  styleUrls: ['./repository-traceability-dialog.component.scss']
})
export class RepositoryTraceabilityDialogComponent implements OnInit {


  public dataSourceCodeRepositoryTraceability = new MatTableDataSource();
  public codeRepositoryTraceabilityColumns = ['name', 'branch', 'commit', 'committedDate'];
  constructor(
    public dialogRef: MatDialogRef<RepositoryTraceabilityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RepositoryTraceabilityDialogData

  ) { }

  ngOnInit(): void {
    if (this.data.codeSourceTraceability !== null && this.data.codeSourceTraceability !== undefined
      && this.data.codeSourceTraceability.length > 0) {
      this.dataSourceCodeRepositoryTraceability = new MatTableDataSource(this.data.codeSourceTraceability);
    }
  }

  closeDialog() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

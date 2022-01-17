import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelStatusDialogData } from 'src/app/models/dialog-data.model';

@Component({
  selector: 'app-models-status-information',
  templateUrl: './models-status-information.component.html',
  styleUrls: ['./models-status-information.component.scss']
})
export class ModelsStatusInformationComponent implements OnInit {

  public processesDict: {};
  public isLoading: boolean;

  public repoList: string[];

  constructor(
    public dialogRef: MatDialogRef<ModelsStatusInformationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModelStatusDialogData) {
    this.isLoading = true;
  }

  ngOnInit(): void {
    this.repoList = Object.keys(this.data.processesDict);
    this.isLoading = false;
  }

  okClick() {
    this.dialogRef.close();
  }

}

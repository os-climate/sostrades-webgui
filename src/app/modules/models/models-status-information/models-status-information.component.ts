import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelStatusDialogData } from 'src/app/models/dialog-data.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-models-status-information',
  templateUrl: './models-status-information.component.html',
  styleUrls: ['./models-status-information.component.scss']
})
export class ModelsStatusInformationComponent implements OnInit {

  public processesDict: {};
  public isLoading: boolean;
  public refreshList: boolean;

  public repoList: string[];

  constructor(
    public processService: ProcessService,
    public hearderService: HeaderService,
    private snackbarService: SnackbarService,
    public dialogRef: MatDialogRef<ModelsStatusInformationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModelStatusDialogData) {
    this.isLoading = true;
    this.refreshList = true;
  }

  ngOnInit(): void {
    this.repoList = Object.keys(this.data.processesDict);
    this.isLoading = false;
  }

  okClick() {
    this.dialogRef.close();
  }

  goToProcess(process) {
    this.dialogRef.close();
    this.processService.processManagementFilter = process;
    this.hearderService.changeIndexTab(1);
  }

}

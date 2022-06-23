import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModelStatusDialogData } from 'src/app/models/dialog-data.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
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
    public ontologyService: OntologyService,
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

    if (this.ontologyService.processData === null
      || this.ontologyService.processData === undefined
      || this.ontologyService.processData.length === 0) {
          this.ontologyService.searchProcess(process);
          this.hearderService.changeIndexTab(1);
      } else {
      this.ontologyService.getOntologyProcess(this.refreshList).subscribe( processes => {
        processes.forEach( processSelected => {
          if (processes.indexOf(processSelected) !== -1) {
            this.ontologyService.searchProcess(process);
            this.hearderService.changeIndexTab(1);
          }
        });
      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading processes : ' + error.description);
        }
      });
    }

    this.ontologyService.processData.forEach(processSelected => {
        if (this.ontologyService.processData.indexOf(processSelected) !== -1) {
          this.ontologyService.searchProcess(process);
          this.hearderService.changeIndexTab(1);
        } else {
          this.snackbarService.showWarning('You not have access to this process');
        }
    });
  }

}

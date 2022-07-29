import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OntologyProcessInformationDialogData } from 'src/app/models/dialog-data.model';
import { Process } from 'src/app/models/process.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { HeaderService } from 'src/app/services/hearder/header.service';


@Component({
  selector: 'app-process-information',
  templateUrl: './process-information.component.html',
  styleUrls: ['./process-information.component.scss']
})
export class ProcessInformationComponent implements OnInit {

  public markdownDocumentation: MardownDocumentation[];
  public hasDocumentation: boolean;
  public loading: boolean;
  public processDatas: string[][];
  public dataSourceModelsUsingByProcess = new MatTableDataSource();
  public modelsUsingByProcessColumns = ['disciplineList', 'goToModel'];
  public dataSourceAssociatedUsecase = new MatTableDataSource();
  public associatedUsecaseColumn = ['name', 'process', 'repository', 'run_usecase'];
  public panelModelsOpenState: boolean;
  public panelUsecaseOpenState: boolean;


  constructor(
    public dialogRef: MatDialogRef<ProcessInformationComponent>,
    public processService: ProcessService,
    private snackbarService: SnackbarService,
    private headerService: HeaderService,
    public ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: OntologyProcessInformationDialogData
    ) {
    this.markdownDocumentation = [];
    this.hasDocumentation = false;
    this.loading = true;
    this.panelUsecaseOpenState = false;
    this.panelModelsOpenState = false;

   }

  ngOnInit(): void {

    // Get markdown documentation
    if (this.data.process !== null && this.data.process !== undefined) {
      if (this.data.process.identifier !== '' && this.data.process.identifier !== null && this.data.process.identifier !== undefined ) {
        this.ontologyService.getOntologyMarkdowndocumentation(this.data.process.identifier).subscribe( response => {
          if ((response.documentation !== null) && (response.documentation !== undefined) && (response.documentation.length > 0)) {
            this.markdownDocumentation = [response];
            this.hasDocumentation = true;
          } else {
            this.hasDocumentation = false;
          }
          this.loading = false;
          }, errorReceived => {
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.snackbarService.showError(error.description);
            } else {
              this.loading = false;
              this.snackbarService.showError('Error loading markdown documentation : ' + error.description);
            }
          });
      } else {
          this.loading = false;
      }

      // Get table to model list
      if ( this.data.process.disciplineList !== null && this.data.process.disciplineList !== undefined
        && this.data.process.disciplineList.length > 0) {
        this.dataSourceModelsUsingByProcess = new MatTableDataSource(this.data.process.disciplineList);
      }
      // Get table to model list
      if ( this.data.process.associatedUsecases !== null && this.data.process.associatedUsecases !== undefined
        && this.data.process.associatedUsecases.length > 0) {
        this.dataSourceAssociatedUsecase = new MatTableDataSource(this.data.process.associatedUsecases);
      }


      // retrieve parameter str data with keys (responsive display data view)
      const parameterKeys = Object.entries(this.data.process);

      const stringData = parameterKeys
      .filter(entry => (typeof entry[1] === 'string' || typeof entry[1] === 'number')
        && entry[1] !== ' '
        && entry[1] !== undefined
        && entry[1] !== null
        && entry[0] !== 'id'
        && entry[0] !== 'processId'
        && entry[0] !== 'processName'
        && entry[0] !== 'processDescription'
        && entry[0] !== 'repositoryId'
        && entry[0] !== 'repositoryName'
        && entry[0] !== 'repositoryDescription'
        && entry[0] !== 'quantityDisciplinesUsed'
        && entry[0] !== 'disciplineList'
        && entry[0] !== 'associatedUsecases')
      .map(entry => [Process.getKeyLabel(entry[0]), entry[1]]);

      this.processDatas = stringData;
    }
  }

  closeDialog() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

  onClick(event, identifier) {
    event.preventDefault();
    const element = document.getElementById(identifier);
    element.scrollIntoView();
  }

  goToModelsStatus(model) {
    this.headerService.changeIndexTab(1);
    this.ontologyService.searchModel(model);
  }

}

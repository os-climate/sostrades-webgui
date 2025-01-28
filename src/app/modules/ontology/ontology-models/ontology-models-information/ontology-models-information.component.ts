import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { OntologyModelsStatusInformationDialogData } from 'src/app/models/dialog-data.model';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { Routing } from 'src/app/models/enumeration.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-ontology-models-information',
  templateUrl: './ontology-models-information.component.html',
  styleUrls: ['./ontology-models-information.component.scss']
})
export class OntologyModelsInformationComponent implements OnInit {

  public modelsStatusDatas: string[][];
  public panelProcessesUsingModelListOpenState: boolean;
  public panelRepoListOpenState: boolean;
  public panelInputsParametersQuantityOpenState: boolean;
  public panelOutputsParametersQuantityOpenState: boolean;
  public panelClassInheritanceOpenState: boolean;
  public processColumns = ['label', 'repository', 'goToProcess'];
  public parameterColumns = ['parameterLabel', 'parameterUri', 'goToParameter'];
  public dataSourceInputsParameters = new MatTableDataSource();
  public dataSourceOutputsParameters = new MatTableDataSource();
  public dataSourceProcessUsed = new MatTableDataSource();


  constructor(
    public dialogRef: MatDialogRef<OntologyModelsInformationComponent>,
    public processService: ProcessService,
    public hearderService: HeaderService,
    private router: Router,
    private snackbarService: SnackbarService,
    public ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: OntologyModelsStatusInformationDialogData
    ) {
    this.panelProcessesUsingModelListOpenState = false;

   }

  ngOnInit(): void {
    if (this.data.modelStatus !== null && this.data.modelStatus !== undefined) {
      // Fill table with input parameters
      if (this.data.modelStatus.inputParameter !== null && this.data.modelStatus.inputParameter !== undefined
        && this.data.modelStatus.inputParameter.length > 0) {
         this.dataSourceInputsParameters = new MatTableDataSource(this.data.modelStatus.inputParameter);
      }
      // Fill table with output parameters
      if (this.data.modelStatus.outputParameter !== null && this.data.modelStatus.outputParameter !== undefined
        && this.data.modelStatus.outputParameter.length > 0) {
          this.dataSourceOutputsParameters = new MatTableDataSource(this.data.modelStatus.outputParameter);
      }
      // Fill table with processes
      if (this.data.modelStatus.processUsingDiscipline !== null && this.data.modelStatus.processUsingDiscipline !== undefined
        && this.data.modelStatus.processUsingDiscipline.length > 0) {
         this.dataSourceProcessUsed = new MatTableDataSource(this.data.modelStatus.processUsingDiscipline);
      }

      const modelsStatusKeys = Object.entries(this.data.modelStatus);

      const stringData = modelsStatusKeys
      .filter(entry => (typeof entry[1] === 'string' || typeof entry[1] === 'number')
        && entry[0] !== 'id'
        && entry[0] !== 'label'
        && entry[0] !== 'icon'
        && entry[0] !== 'processesUsingModel'
        && entry[0] !== 'inputParameterQuantity'
        && entry[0] !== 'outputParameterQuantity'
        )
      .map(entry => [OntologyModelStatus.getKeyLabel(entry[0]), entry[1]]);

      this.modelsStatusDatas = stringData;
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

  goToProcess(process) {
    this.dialogRef.close();
    this.hearderService.changeIndexTab(2);
    this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES], {queryParams: {process: `${process}`}});

  }

  goToParameter(parameter) {
    this.dialogRef.close();
    this.hearderService.changeIndexTab(3);
    this.router.navigate([Routing.ONTOLOGY, Routing.ONTOLOGY_PARAMETERS], {queryParams: {parameter: `${parameter}`}});

  }

}

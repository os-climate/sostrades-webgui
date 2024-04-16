import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OntologyProcessInformationDialogData } from 'src/app/models/dialog-data.model';
import { Process } from 'src/app/models/process.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { Router } from '@angular/router';
import { Routing } from 'src/app/models/enumeration.model';
@Component({
  selector: 'app-ontology-process-information',
  templateUrl: './ontology-process-information.component.html',
  styleUrls: ['./ontology-process-information.component.scss']
})
export class OntologyProcessInformationComponent implements OnInit {

  public processDatas: string[][];
  public dataSourceModelsUsingByProcess = new MatTableDataSource();
  public modelsUsingByProcessColumns = ['disciplineList', 'goToModel'];
  public dataSourceAssociatedUsecase = new MatTableDataSource();
  public associatedUsecaseColumn = ['name', 'process', 'repository', 'run_usecase'];
  public panelModelsOpenState: boolean;
  public panelUsecaseOpenState: boolean;


  constructor(
    public dialogRef: MatDialogRef<OntologyProcessInformationComponent>,
    public processService: ProcessService,
    private headerService: HeaderService,
    public ontologyService: OntologyService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: OntologyProcessInformationDialogData
    ) {
    this.panelUsecaseOpenState = false;
    this.panelModelsOpenState = false;

   }

  ngOnInit(): void {

    // Get markdown documentation
    if (this.data.process !== null && this.data.process !== undefined) {
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
    this.dialogRef.close();
    this.headerService.changeIndexTab(1);
    this.router.navigate([Routing.ONTOLOGY, Routing.MODELS], {queryParams: {model: `${model}`}});
  }

}

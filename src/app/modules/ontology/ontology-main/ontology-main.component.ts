import { Component, OnInit } from '@angular/core';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { OntologyGeneralInformation } from 'src/app/models/ontology-general-information.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { RepositoryTraceabilityDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { RepositoryTraceabilityDialogComponent } from './repository-traceability-dialog/repository-traceability-dialog.component';
import { OntologyDirectService } from 'src/app/services/ontology-direct/ontology-direct.service';

@Component({
  selector: 'app-ontology-main',
  templateUrl: './ontology-main.component.html',
  styleUrls: ['./ontology-main.component.scss']
})
export class OntologyMainComponent implements OnInit {

  public isLoading: boolean;
  public generalInformation: OntologyGeneralInformation;
  public panelOpenState: boolean;
  public urlXlsx: string;
  public urlOwl: string;
  public ontologyisUp: boolean;

  constructor(
    private snackbarService: SnackbarService,
    private headerService: HeaderService,
    public ontologyService: OntologyService,
    public ontologyDirectService: OntologyDirectService,
    private dialog: MatDialog,

  ) {
    this.ontologyisUp = true;
    this.isLoading = false;
    this.generalInformation = null;
    this.panelOpenState = false;
   }

  ngOnInit(): void {
  const informationsDict = this.ontologyService.generalInformationData;
  if (informationsDict === null || informationsDict === undefined) {
      this.loadOntologyGeneralInformation();
  } else {
      this.generalInformation = this.ontologyService.generalInformationData;
      this.isLoading = false;
    }
  this.urlXlsx = this.ontologyDirectService.getOntologyDowloadUrlXlsx();
  this.urlOwl = this.ontologyDirectService.getOntologyDowloadUrlOwl();
  }

  public loadOntologyGeneralInformation() {
    this.isLoading = true;
     // Retrieving study case list
    this.ontologyService.getOntologyGeneralInformation().subscribe(
      (informations) => {
        let oneValueNotUndefined = false;
        Object.values(informations).forEach(value => {
          if (value !== undefined) {
            oneValueNotUndefined = true;          }
        });
        this.ontologyisUp = oneValueNotUndefined;
        this.generalInformation = informations;
        this.isLoading = false;
      },
      (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.isLoading = false;
          this.snackbarService.showError(
            'Error loading parameters list : ' + error.description
          );
        }
      }
    );
  }

  openTraceability(codeReposity: any) {
    const dialogData: RepositoryTraceabilityDialogData = new RepositoryTraceabilityDialogData();

    dialogData.codeSourceTraceability = codeReposity;

    const dialogRef = this.dialog.open(RepositoryTraceabilityDialogComponent, {
      disableClose: false,
      width: '800px',
      height: '400px',
      data: dialogData
    });
  }

  goToModels() {
    this.headerService.changeIndexTab(1);
  }
  goToProcesses() {
    this.headerService.changeIndexTab(2);
  }
  goToParameters() {
      this.headerService.changeIndexTab(3);
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OntologyProcessInformationDialogData } from 'src/app/models/dialog-data.model';
import { Process } from 'src/app/models/process.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

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



  constructor(
    public dialogRef: MatDialogRef<ProcessInformationComponent>,
    public processService: ProcessService,
    private snackbarService: SnackbarService,
    public ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: OntologyProcessInformationDialogData
    ) {
    this.markdownDocumentation = [];
    this.hasDocumentation = false;
    this.loading = true;

   }

  ngOnInit(): void {
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
        }
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
      && entry[0] !== 'repositoryDescription')
    .map(entry => [Process.getKeyLabel(entry[0]), entry[1]]);

    this.processDatas = stringData;
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

}

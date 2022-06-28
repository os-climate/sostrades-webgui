import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OntologyModelsStatusInformationDialogData } from 'src/app/models/dialog-data.model';
import { OntologyModelStatus } from 'src/app/models/ontology-model-status.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-models-status-documentation',
  templateUrl: './models-status-documentation.component.html',
  styleUrls: ['./models-status-documentation.component.scss']
})
export class ModelsStatusDocumentationComponent implements OnInit {

  public markdownDocumentation: MardownDocumentation[];
  public hasDocumentation: boolean;
  public loading: boolean;
  public modelsStatusDatas: string[][];




  constructor(
    public dialogRef: MatDialogRef<ModelsStatusDocumentationComponent>,
    public ontologieService: OntologyService,
    private snackbarService: SnackbarService,
    public ontologyService: OntologyService,
    @Inject(MAT_DIALOG_DATA) public data: OntologyModelsStatusInformationDialogData
    ) {
    this.markdownDocumentation = [];
    this.hasDocumentation = false;
    this.loading = true;

   }

  ngOnInit(): void {
    if (this.data.modelStatus !== null && this.data.modelStatus !== undefined) {
      if (this.data.modelStatus.id !== '') {
        this.ontologyService.getOntologyMarkdowndocumentation(this.data.modelStatus.id).subscribe( response => {
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
      const modelsStatusKeys = Object.entries(this.data.modelStatus);

      const stringData = modelsStatusKeys
      .filter(entry => (typeof entry[1] === 'string' || typeof entry[1] === 'number')
        && entry[0] !== 'id'
        && entry[0] !== 'name'
        && entry[0] !== 'icon'
        && entry[0] !== 'processesUsingModel')
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

}

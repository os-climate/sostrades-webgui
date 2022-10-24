import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { stringify } from 'querystring';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-study-case-documentation',
  templateUrl: './study-case-documentation.component.html',
  styleUrls: ['./study-case-documentation.component.scss']
})
export class DocumentationComponent implements OnChanges {

  @Input('identifiers') identifiers: string[];
  public documentation: MardownDocumentation[];
  public loading: boolean;
  public hasDocumentation: boolean;
  public showBookmarks: boolean;

  constructor(public ontologyService: OntologyService,
    public snackbarService: SnackbarService) {
    this.hasDocumentation = false;
    this.showBookmarks = false;
    this.documentation = [];
  }
  ngOnChanges(): void {
    this.updateDocumentation();
  }

  private updateDocumentation() {
    this.documentation = [];
    this.loading = true;
    let documentationRetrieved = 0;
    this.identifiers.forEach(identifier=>{
      this.ontologyService.getOntologyMarkdowndocumentation(identifier).subscribe( response => {
        if ((response.documentation !== null) && (response.documentation !== undefined) && (response.documentation.length > 0)) {
          response.name = identifier;
          this.documentation.push(response);
          this.hasDocumentation = true;
        } else if(this.documentation.length == 0){
          this.hasDocumentation = false;
        }
        documentationRetrieved = documentationRetrieved+1;
        if (documentationRetrieved === this.identifiers.length){
          this.loading = false;
          this.showBookmarks = this.documentation.length > 1;
        }
      }, errorReceived => {
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.snackbarService.showError(error.description);
            } else {
              this.loading = false;
              this.snackbarService.showError('Error loading markdown documentation : ' + error.description);
            }
          });
    });
  }

  onClick(event, identifier) {
    event.preventDefault();
    const element = document.getElementById(identifier);
    element.scrollIntoView();
  }

}

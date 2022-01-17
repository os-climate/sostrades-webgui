import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MardownDocumentation } from 'src/app/models/tree-node.model';

@Component({
  selector: 'app-study-case-documentation',
  templateUrl: './study-case-documentation.component.html',
  styleUrls: ['./study-case-documentation.component.scss']
})
export class DocumentationComponent implements OnInit, OnChanges {

  @Input('documentation') documentation: MardownDocumentation[];

  public hasDocumentation: boolean;
  public showBookmarks: boolean;

  constructor() {
    this.hasDocumentation = false;
    this.showBookmarks = false;
  }

  ngOnInit(): void {
    this.updateDocumentation();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateDocumentation();
  }

  private updateDocumentation() {
    if (this.documentation !== null && this.documentation !== undefined && this.documentation.length > 0) {
      this.hasDocumentation = true;
      this.showBookmarks = this.documentation.length > 1;
    } else {
      this.hasDocumentation = false;
      this.showBookmarks = false;
    }
  }

  onClick(event, identifier) {
    event.preventDefault();
    const element = document.getElementById(identifier);
    element.scrollIntoView();
  }

}

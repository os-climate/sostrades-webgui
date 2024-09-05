import { AfterViewInit, Component, ElementRef, Input, OnChanges, Renderer2} from '@angular/core';
import { KatexOptions } from 'ngx-markdown';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { MardownDocumentation } from 'src/app/models/tree-node.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-study-case-documentation',
  templateUrl: './study-case-documentation.component.html',
  styleUrls: ['./study-case-documentation.component.scss']
})
export class DocumentationComponent implements OnChanges, AfterViewInit  {

  @Input('identifiers') identifiers: string[];
 
  public documentation: MardownDocumentation[];
  public loading: boolean;
  public hasDocumentation: boolean;
  public showBookmarks: boolean;
  private hasDocumentationSubject = new BehaviorSubject<boolean>(false);

  public options: KatexOptions = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$",   right: "$",   display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    displayMode: true,
    macros: {"\\R": "\\mathbb{R}"},
  }

  constructor(
    public ontologyService: OntologyService,
    public snackbarService: SnackbarService,
    private el: ElementRef,
    private renderer: Renderer2
    ) {
    this.hasDocumentation = false;
    this.showBookmarks = false;
    this.documentation = [];
  }
  ngOnChanges (): void {
    
    this.updateDocumentation();  
    setTimeout(() => {
      this.hasDocumentationSubject.next(true);  // Émettre la valeur true pour indiquer que la documentation est prête
    }, 1000);  
  }

  ngAfterViewInit() {
    this.insertAttributOnReference();
  }

    /**
   * This function has been created because there are not plugin footnote for ngx-markdown v15. marked-footnote V1.0.0 will be available with marked v.7.0.0 with ngx-markdown v17.0.0. with angular v17. 
   * This function is triggered when the documentation is ready. 
   * It performs several tasks:
   * - Adds unique IDs to footnote references and sets up smooth scrolling for footnote navigation.
   * - Adds unique IDs to list items of footnotes and sets up smooth scrolling for back references.
   * - Hides paragraphs that contain base64 image references.
   */
  private insertAttributOnReference() {
    this.hasDocumentationSubject
      .pipe(filter(hasDoc => hasDoc))
      .subscribe(() => {
        // Add IDs to footnote reference elements and set up smooth scrolling
        this.el.nativeElement.querySelectorAll('.footnote-ref a').forEach((element: HTMLElement) => {
            const href = element.getAttribute('href');
            const classRef = element.getAttribute('class');
            if (href && classRef) {
                element.setAttribute('id', classRef);
                element.removeAttribute('class');
                // Add an event listener for smooth scrolling to the target
                element.addEventListener('click', (event) => {
                    event.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = this.el.nativeElement.querySelector(`#${targetId}`);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });  
                    }
                });
            }
        });

        // Add unique IDs to footnote list items and set up smooth scrolling for back references
        this.el.nativeElement.querySelectorAll('li.footnote-item').forEach((element: HTMLElement, index) => {
            const id = `fn${index + 1}`;
            element.setAttribute('id', id);
            // Add an event listener for smooth scrolling back to the footnote reference
            element.querySelectorAll('.footnote-backref').forEach((backrefElement: HTMLElement) => {
                const backHref = backrefElement.getAttribute('href');
                if (backHref) {
                    backrefElement.addEventListener('click', (event) => {
                        event.preventDefault();
                        const targetId = backHref.substring(1);
                        const targetElement = this.el.nativeElement.querySelector(`#${targetId}`);
                        if (targetElement) {
                            targetElement.scrollIntoView();
                        }
                    });
                }
            });
        });

        // Hide paragraphs that contain base64 image references
        const base64ImageReferenceRegex = /\[.*?\]:\s*data:image\/(PNG|png|jpg|jpeg|gif);base64,.*?(\r?\n|$)/g;
        this.el.nativeElement.querySelectorAll('p').forEach((element: HTMLElement) => {
            if (base64ImageReferenceRegex.test(element.innerHTML)) {
              console.log(element)
                this.renderer.setStyle(element, 'display', 'none');
            }
        });
        // Target element .katex-display > .katex et supprimer white-space: nowrap
        const katexElements = this.el.nativeElement.querySelectorAll('.katex-display > .katex');
        katexElements.forEach((element: HTMLElement) => {
          this.renderer.setStyle(element, 'white-space', 'normal');
        });
      });
  }

  private updateDocumentation() {
    this.documentation = [];
    this.loading = true;
    let documentationRetrieved = 0;
    this.identifiers.forEach(identifier => {
      this.ontologyService.getOntologyMarkdowndocumentation(identifier).subscribe({
        next: (response) => {
          if ((response.documentation !== null) && (response.documentation !== undefined) && (response.documentation.length > 0)) {
            response.name = identifier;
            response.documentation = this.transformFootnotesAndEquationKatexAndImages(response.documentation);
            this.documentation.push(response);
            this.hasDocumentation = true;
          } else if (this.documentation.length == 0) {
            this.hasDocumentation = false;
          }
          documentationRetrieved = documentationRetrieved + 1;
          if (documentationRetrieved === this.identifiers.length) {
            this.loading = false;
            this.showBookmarks = this.documentation.length > 1;
          }
        },
        error: (errorReceived) => {
          const error = errorReceived as SoSTradesError;
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.loading = false;
            this.snackbarService.showError('Error loading markdown documentation : ' + error.description);
          }
        }
      });
    });
  }

/**
 * This function has been created because there are not plugin footnote for ngx-markdown v15. marked-footnote V1.0.0 will be available with marked v.7.0.0 with ngx-markdown v17.0.0. with angular v17. 
 * This function processes footnotes within the provided markdown content.
 * It performs the following tasks:
 * - Identifies and stores footnotes in a dictionary.
 * - Replaces inline footnote references with links.
 * - Builds a list of footnotes with back reference links.
 * - Adds a hidden class to elements containing base64 image references.
 * 
 * @param markdown - The input markdown string containing footnotes and base64 image references.
 * @returns The processed markdown string with footnote links and a footnote list.
 */
  private transformFootnotesAndEquationKatexAndImages(markdown: string): string {
    // const footnoteRegex = /\[\^(\d+)\]:\s((?:.|\n)+?)(?=\n\[\^|\n*$)/gs;
    const footnoteRegex = /\[\^(\d+)\]:\s*((?:.|\n(?!\[\^))*)(?=\n\[\^|$)/gm;

    // const footnoteRegex = /\[\^(\d+)\]:\s*(.*)/g;
    const inlineFootnoteRegex = /\[\^(\d+)\]/g;
    const katexEquationRegex = /\$\$([^\$]+)\$\$/g;
    const katex2ndEquationRegex = /(?<![^\s\(])\$(?![\/\\])([^\$]+?)\$/g;

    const base64ImageReferenceRegex = /!\[\]\[*.*\]/g;
      
    let footnoteList = '<ol>';
    const footnoteMap: { [id: string]: { content: string, backrefs: string[] } } = {};
    const footnoteOccurrences: { [id: string]: number } = {};
    let match;
    
    // Display undescore on equations
    markdown = markdown.replace(katexEquationRegex, (match, equation) => {
      const escapedEquation = equation.replace(/_/g, '\\_');
      return `$$${escapedEquation}$$`;
      });
    
    // Display undescore on equations
    markdown = markdown.replace(katex2ndEquationRegex, (match, equation) => {
      const escapedEquation = equation.replace(/_/g, '\\_');
      return `$${escapedEquation}$`;
    });

    
    // Find all footnotes and store them in a dictionary  
    const sectionRegex = /^(#+\s*Sources|#+\s*References)/mi;
    const sectionMatch = markdown.match(sectionRegex);

    if (sectionMatch) {
      const referenceIndex = sectionMatch.index;
      const beforeReferences = markdown.slice(0, referenceIndex);
      let references = markdown.slice(referenceIndex);
    
      // Extract footnotes from the references section
      while ((match = footnoteRegex.exec(references)) !== null) {
        const id = match[1];
        const content = match[2];
        if (!footnoteMap[id]) {
          footnoteMap[id] = { content, backrefs: [] };
        }
      }

      // Apply replacement only on the references part
      references = references.replace(footnoteRegex, '');

      // Rebuild the markdown
      markdown = beforeReferences + references;
    }

   
    // Regex to retrieve images base64 
    const imageRefs = {};
    const base64Regex = /\[([^\]]+)\]:\s*data:image\/([a-zA-Z]+);base64,([^\s]+)/g;
    markdown = markdown.replace(base64Regex, (match, p1, p2, p3) => {
      imageRefs[p1.replace(/_/g, '-')] = `data:image/${p2};base64,${p3}`;
      return ''; // Delete reference of marldown
    });

    // Regex to replace reference by <img>
    const refRegex = /!\[\]\[([^\]]+)\]/g;
    markdown = markdown.replace(refRegex, (match, p1) => {
      const imageName = p1.replace(/_/g, '-');
      if (imageRefs[imageName]) {
        return `<img src="${imageRefs[imageName]}" alt="${imageName}">`;
      }
      return match; // Return original text if not corresponding reference
    });
  
    
    markdown =  markdown = markdown.replace(base64ImageReferenceRegex, (match, equation) => {
      return match
    });
  
    // Replace inline footnote references and add back reference links
    markdown = markdown.replace(inlineFootnoteRegex, (match, id) => {
      if (!footnoteOccurrences[id]) {
        footnoteOccurrences[id] = 0;
      }
      footnoteOccurrences[id]++;
      const occurrence = footnoteOccurrences[id];
      const displayId = occurrence === 1 ? id : `${id}-${occurrence - 1}`;
  
      if (footnoteMap[id]) {
         footnoteMap[id].backrefs.push(`<a href="#fnref${displayId}" class="footnote-backref">↩︎</a>`);
      }
  
      return `<sup class="footnote-ref"><a href="#fn${id}" class="fnref${displayId}">[${displayId}]</a></sup>`;
    });
  
    // Build the footnote list with back reference links
    for (const id in footnoteMap) {
      const { content, backrefs } = footnoteMap[id];
      footnoteList += `<li class="footnote-item">${content} ${backrefs.join(' ')}</li>`;
    }
    footnoteList += '</ol>';
    
    return markdown + footnoteList
}
  
  onClick(event, identifier) {
    event.preventDefault();
    const element = document.getElementById(identifier);
    element.scrollIntoView();
  }

}

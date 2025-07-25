import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Graphviz, graphviz } from 'd3-graphviz';
import {Selection, BaseType, DragBehavior, ZoomBehavior, select} from 'd3';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { VisualisationService } from 'src/app/services/visualisation/visualisation.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { VisualizationDiagrams } from 'src/app/models/study.model';



@Component({
  selector: 'app-visualisation-interface-diagram',
  templateUrl: './visualisation-interface-diagram.component.html',
  styleUrls: ['./visualisation-interface-diagram.component.scss']
})
export class VisualisationInterfaceDiagramComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphviz_placeholder', { static: true }) private el: ElementRef;

  public isLoading: boolean;

  svg: Selection<any, unknown, null, undefined>;
  graph: Graphviz<BaseType, any, BaseType, any>;
  dotString: string;
  drag:DragBehavior<Element, unknown, unknown>;
  zoom:ZoomBehavior<Element, unknown>;
  private resizeObserver: ResizeObserver;
  private resizeTimeout: any;

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private visualisationService: VisualisationService,
    private snackbarService: SnackbarService
  ) { this.isLoading = true; }

  ngOnInit(): void {
    const loadedStudy = this.studyCaseDataService.loadedStudy;

    if (loadedStudy !== null && loadedStudy !== undefined) {
      if (Object.keys(loadedStudy.n2Diagram).length === 0 ||!Object.keys(loadedStudy.n2Diagram).includes(VisualizationDiagrams.INTERFACE)) {
        if (this.studyCaseDataService.preRequisiteReadOnlyDict.allocation_is_running) {
          this.visualisationService.getInterfaceDiagramData(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe({
            next: (res: any) => {
              this.dotString = res['dotString'];
              this.initGraph();
            },
            error: (err) => {
              this.isLoading = false;
              this.snackbarService.showError(err.description);
            }
          }); 
        } else {
          this.snackbarService.showError(`This interface diagram is not available for this study. To show it, please switch to edition mode`);
          this.isLoading = false;
        }
      } else if (Object.keys(loadedStudy.n2Diagram).includes(VisualizationDiagrams.INTERFACE)){
        this.dotString = loadedStudy.n2Diagram[VisualizationDiagrams.INTERFACE]['dotString'];
        this.initGraph();
      }
    }
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        if (!this.isLoading && this.dotString) {
          this.initGraph();
        }
      }, 200);
    });
    if (this.el && this.el.nativeElement) {
      this.resizeObserver.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver && this.el && this.el.nativeElement) {
      this.resizeObserver.unobserve(this.el.nativeElement);
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  initGraph(): void {
    select(this.el.nativeElement).selectAll('svg').remove();

    this.svg = select(this.el.nativeElement).append('svg')
      .attr('class', 'graphviz-graph')
      .attr('id', 'graphviz-graph')
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible')
      .style('cursor', 'default');

      const margin = 20; // to avoid scrollbars
      let width = window.innerWidth - margin;
      let height = window.innerHeight - margin;
      
      try {
        const el   = document.getElementsByTagName('app-visualisation-interface-diagram')[0];
        if (el) {
          const rect = el.getBoundingClientRect();
          width = rect.width - margin;
          height = rect.height - margin;
        }
        
      } catch (error) {
        this.snackbarService.showError(error);
      }

    this.graph = graphviz('#graphviz-graph', {
      useWorker: false,
      width,
      height,
      scale: 1,
      fit: true,
      zoom: true,
      zoomScaleExtent: [0.1,Infinity],
    });

    this.graph
      .on('initEnd', () => this.renderGraph(this.dotString));
  }

  renderGraph(dotString: string): void {
    this.graph
      .onerror(this.error)
      .dot(dotString)
      .transition()
      .render()
      .on('end', () => this.temp());
    
    }
    
  temp():void {
      this.isLoading = false;
      
  }

  resetZoom():void {
    this.graph.resetZoom();
  }
  
  error(err: any): void {
    console.log('Caught error:', err);
  }

  downloadSVG():void {
    this.resetZoom();
    try {
      // const diagramElement = document.querySelector("#graphviz-graph > svg")
      // // fix svg namespaces
      // diagramElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      // diagramElement.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

      // const svgBlob = new Blob([diagramElement.innerHTML], {type:"image/svg+xml;charset=utf-8"});
      // const svgBlob = new Blob([diagramElement.property('innerHTML')], {type:"image/svg+xml;charset=utf-8"});
      const svgBlob = new Blob([this.svg.property('innerHTML')], {type:"image/svg+xml;charset=utf-8"});
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(svgBlob);
      downloadLink.setAttribute('download', this.studyCaseDataService.loadedStudy.studyCase.name + '_interface_diagram.svg');
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
        console.error(error);
    }
  }
}

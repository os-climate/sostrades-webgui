import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as d3 from 'd3';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { LoggerService } from 'src/app/services/logger/logger.service';


@Component({
  selector: 'app-models-links',
  templateUrl: './models-links.component.html',
  styleUrls: ['./models-links.component.scss']
})
export class ModelsLinksComponent implements OnInit {

  @ViewChild('d3_placeholder', { static: true }) private el: ElementRef;

  public isLoading: boolean;

  constructor(
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private loggerService: LoggerService) {

    this.isLoading = false;
  }
  colorScale: any;
  nodes: any;
  links: any;
  data: any;
  types: any;
  svg: any;
  simulation: any;
  tooltipDiv: any;
  container: any;
  path: any;
  circle: any;
  t: any;
  drag: any;
  selectedModelTypes: string[] = [];
  selectedProcess: string[] = [];
  typeList: string[] = ['Research', 'Official', 'Other'];
  processList: any;
  allProcess: string[] = [];
  processRepo: string[];
  // tslint:disable-next-line: max-line-length
  legendKeys: string[] = ['name', 'type','model_type', 'source', 'delivered', 'implemented', 'last_publication_date', 'id', 'discipline', 'class name', 'inputs_parameters_quantity', 'outputs_parameters_quantity', 'processes_using_model', 'processes_using_model_list', 'validator', 'validated','description','model_type'];
  hiddenNodes: any;
  hiddenLinks: any;
  informationPanel:d3.Selection<any,any,any,any>;
  radiusScale:any;
  linkWidthScale:any;


  ngOnInit(): void {

    this.isLoading = true;
    this.ontologyService.getOntologyModelsLinks().subscribe(ontologyN2 => {
      this.isLoading = false;
      this.data = ontologyN2;
      this.processList = this.data.processList;
      this.processRepo = Object.keys(this.data.processList);
      this.initGraph();

    }, errorReceived => {
      this.isLoading = false;
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error while loading models links : ' + error.description);
      }
    });
  }
  initGraph(): void {
    this.selectedModelTypes = this.typeList;
    this.allProcess = (Object.values(this.data.processList) as any).flat();
    this.allProcess.push('noProcess');
    this.selectedProcess = this.allProcess;

    // initialize node and links visibility
    this.nodes = this.resetActive(this.data.nodes, 1);
    this.links = this.resetActive(this.data.links, 1);

    const width = 1000;
    const height = 1000;

    this.radiusScale = d3.scaleLinear()
    .domain([0,200])
    .range([5,50])
    .clamp(true);

    this.linkWidthScale= d3.scaleLinear()
    .domain([0,200])
    .range([2,50])
    .clamp(true);

    d3.select(this.el.nativeElement).selectAll('svg').remove();

    // Define the div for the tooltip
    this.tooltipDiv = d3.select(this.el.nativeElement).append('div')
      .attr('class', 'tooltip')
      .style('position', 'fixed')
      .style('display', 'none')
      .style('justify-content', 'space-between')
      .style('flex-wrap', 'wrap');

      // Define the div for the information panel
      this.informationPanel = d3.select('.node-information')
        .style('display', 'none')
        .style('justify-content', 'space-between')
        .style('flex-wrap', 'wrap')
        .html('');

    this.svg = d3.select(this.el.nativeElement).append('svg')
      .attr('class', 'd3-graph')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible');

    this.colorScale = d3.scaleOrdinal(d3.schemeSet2);

    this.types = Array.from(new Set(this.links.map((d: any) => d['type']))).concat(Array.from(new Set(this.nodes.map((d: any) => d['model_type']))));

    this.container = this.svg.append('svg:g').attr('class', 'everything');
    this.svg.append('svg:defs').attr('class', 'arrows-marker');

    // Per-type markers, as they don't inherit styles.
    this.svg.select('.arrows-marker').selectAll('.marker_end')
      .data(this.types)
      .enter()
      .append('svg:marker')
      .attr('class', 'marker_end')
      .attr('id', d => `end-arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', (d: any) => this.colorScale(d))
      .attr('d', 'M0,-5L10,0L0,5');

    this.svg.select('.arrows-marker').selectAll('.marker_end_hover')
      .data(this.types)
      .enter()
      .append('svg:marker')
      .attr('class', 'marker_end_hover')
      .attr('id', d => `end-arrow-hover-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 7)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', (d: any) => d3.rgb(this.colorScale(d)).darker().toString())
      .attr('d', 'M0,-5L10,0L0,5');

    this.svg.call(
      d3.zoom()
        .scaleExtent([.1, 4])
        .on('zoom', (event:any) => { this.container.attr('transform', event.transform); })
    );

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d['id']).distance(100))
      .force('charge', d3.forceManyBody().strength(-2500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.3))
      .force('y', d3.forceY(height / 2).strength(0.3))
      .on('tick', () => this.tick());

    // handles to link and node element groups
    this.container.append('svg:g').attr('fill', 'none').attr('class', 'links');
    this.container.append('svg:g').attr('class', 'nodes');

      // init D3 drag support
    this.drag = d3.drag()
    .on('start', (event:any,d: any) => this.draggedStart(event,d))
    .on('drag', (event:any,d: any) => this.dragged(event,d))
    .on('end', (event:any,d: any) => this.draggedEnd(event,d));

    this.svg.append('g').attr('class', 'legend');
    // Add Legend
    const legend = this.svg.select('.legend');
    legend.attr(
      'transform',
      `translate(${5},${5 + 5 * this.types.length})`
    );

    legend
      .selectAll('g')
      .data(this.types)
      .join('g')
      .attr('transform', (d, i) => `translate(5,${15 * i})`)
      .html(
        d =>
          `<circle r="5" stroke="black" stroke-width="1px" fill="${this.colorScale(d)}"></circle>` +
          `<text transform="translate(8,2.5)">${d}</text>`
      );

    this.loggerService.log('End of init, start to draw');
    this.restart();
  }

  tick(): void {
    // draw directed edges with proper padding from node centers
    this.container.select('.links').selectAll('.link').attr('d', (d: any) => {
      const deltaX = d.target.x - d.source.x;
      const deltaY = d.target.y - d.source.y;

      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      let normX = 0;
      let normY = 0;
      if (dist !== 0) {
        normX = deltaX / dist;
        normY = deltaY / dist;
      }
      const sourcePadding = this.radius(d.source);
      const targetPadding = this.radius(d.target);
      const sourceX = d.source.x + (sourcePadding * normX);
      const sourceY = d.source.y + (sourcePadding * normY);
      const targetX = d.target.x - (1.3 * targetPadding * normX);
      const targetY = d.target.y - (1.3 * targetPadding * normY);
      const r = Math.hypot(deltaX, deltaY);


      if (d['type'] === 'groupLink') {
        // arc path
        return `
        M${sourceX},${sourceY}
        A${r},${r} 0 0,1 ${targetX},${targetY}
        `;

      } else {
        //strainght path
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      }

    });

    this.container.select('.nodes').selectAll('g').attr('transform', (d) => `translate(${d.x},${d.y})`);
  }

  restart(): void {
    // draw links
    this.path = this.container
      .select('.links')
      .selectAll('g')
      .data(this.getActive(this.links),  function(d) { return d ? d.id : this.id; })
      .join(
        enter => this.enterLink(enter),
        update => this.updateLink(update),
        exit => this.exitLink(exit),
      )
      .on('mouseover', (event:any,d: any) => {
        const darker = d3.rgb(this.color(d)).darker().toString();
        d3.select(event.currentTarget).select('.link')
          .style('stroke', darker)
          .attr('marker-end', (d: any) => `url(#end-arrow-hover-${d['type']})`);
        this.tooltip(d, true);
      })
      .on('mouseout', (event:any,d: any) => {
        this.tooltipDiv
          .style('display', 'none');
        d3.select(event.currentTarget).select('.link')
          .style('stroke', (d: any) => this.color(d))
          .attr('marker-end', (d: any) => `url(#end-arrow-${d['type']})`);
      })
      .on('click',(event:any,d: any) => {this.click(d,true)});


    // updates node
    this.circle = this.container
      .select('.nodes')
      .selectAll('g')
      .data(this.getActive(this.nodes),  function(d) { return d ? d.id : this.id; })
      .join(
        enter => this.enterNode(enter),
        update => update,
        exit => this.exitNode(exit),
      )
      .call(this.drag)
      .on('mouseover', (event:any,d: any) => {
        const darker = d3.rgb(this.color(d)).darker().toString();
        d3.select(event.currentTarget).select('circle')
          .style('fill', darker);
        this.tooltip(d, false);

      })
      .on('mouseout', (event:any,d: any) => {
        this.tooltipDiv
          .style('display', 'none');
        d3.select(event.currentTarget).select('circle')
          .style('fill', this.color(d));
      })
      .on('click',(event:any,d: any) => {this.click(d,false)});


    // set the graph in motion
    this.simulation.nodes(this.getActive(this.nodes));
    this.simulation.force('link').links(this.getActive(this.links));
    // .restart();

    this.simulation.restart();
  }

  radius(node: any) {
    let inputSize = 0;
    if (node['input_parameters_quantity'] !== undefined && node['input_parameters_quantity'] !== null) {
      inputSize = parseInt(node['input_parameters_quantity'],10);
    }
    let outputSize = 0;
    if (node['output_parameters_quantity'] !== undefined && node['output_parameters_quantity'] !== null) {
      outputSize = parseInt(node['output_parameters_quantity'],10);
    }
    const radius = this.radiusScale(inputSize + outputSize)
    return radius;
  }

  color(d: any): any {
    let type = 'type';
    if ('model_type' in d) {
      type = d['model_type'];
    } else if ('type' in d) {
      type = d['type'];
    }
    return this.colorScale(type);
  }

  generateHtmlInformation(node:any,link: boolean) :string {
    let htmlContent = '';
    const headerHtml = [];
    const contentHtml = [];
    if (link) {
      headerHtml.push(`<h4>Link</h4>`);

      contentHtml.push(`<div><b>Model Source : </b> ${this.getNodeLabel(node['source'])}</div>`);
      contentHtml.push(`<div><b>Model Target : </b> ${this.getNodeLabel(node['target'])}</div>`);
      contentHtml.push(`<div><b>Number of parameters exchanged : </b> ${String(node['metadata']['size'])}</div>`);
      const parameterList = node['metadata']['parameterList'];
      if (parameterList.length > 0) {
        contentHtml.push(`<div><table class="table table-condensed table-striped" style="border-spacing: 0;padding: 1px;"><thead><tr><th style="padding: 1px;">Parameters exchanged</th></tr></thead><tbody>`);
        parameterList.forEach(key => {
          contentHtml.push(`<tr><td style="padding: 1px;">${key}</td></tr>`);
        });
        contentHtml.push(`</tbody></table></div>`);
      }

    } else {
      headerHtml.push(`<h4>${this.getNodeLabel(node)}</h4>`);

      if (node['name'] !== undefined && node['name'] !== null) {
        contentHtml.push(`<div><b>Name: </b> ${node['name']}</div>`);
      }
      if (node['id'] !== undefined && node['id'] !== null) {
        contentHtml.push(`<div><b>ID: </b> ${node['id']}</div>`);
      }
      Object.keys(node).forEach(k => {
        if (this.legendKeys.includes(k.toLowerCase()) && k !== 'name' && k !== 'id' && node[k] !== null) {
          if (k==='processes_using_model_list') {
            if (Object.keys(node[k]).length >0) {
              contentHtml.push(`<div><table class="table table-condensed" style="border-spacing: 0;padding: 1px;"><thead><tr><th style="padding: 1px;">Repository</th><th style="padding: 1px;">Process</th></tr></thead><tbody>`);
              Object.keys(node[k]).forEach(repo => {
                contentHtml.push(`<tr><td><b>${repo}</b></td>`);
                contentHtml.push(`<td><table class="table table-condensed table-striped" style="border-spacing: 0;padding: 1px;"><tbody>`);

                node[k][repo].forEach(p => {
                  contentHtml.push(`<tr><td style="padding: 1px;">${p}</td></tr>`);
                });
                contentHtml.push(`</tbody></table></tr>`);
              });
              contentHtml.push(`</tbody></table></div>`);
            }
          } else {
            contentHtml.push(`<div><b>${k}: </b> ${node[k]}</div>`);
          }
        }
      });
    }

    htmlContent = headerHtml.concat(contentHtml).join('');
    return htmlContent;
  }

  getNodeLabel(node:any) :string{
    if (node['name'] !== undefined && node['name'] !== null) {
      return node['name'];
    } else {
      return node['id'];
    }
  }

  tooltip(node: any, link: boolean) :void {
    const tooltipContent = this.generateHtmlInformation(node,link)

    const width = window.document.getElementsByClassName('d3-graph')[0]['clientWidth'];
    const height = window.document.getElementsByClassName('d3-graph')[0]['clientHeight'];
    const event = (window as any).event;
    const onRight = event.offsetX < width / 2;
    const under = event.offsetY < height / 2;

    this.tooltipDiv
      .html(tooltipContent)
      .style('display', 'inline')
      .style('opacity', 1)
      .style('width', 'auto')
      .style('height', 'auto')
      .style('top', under ? event.y + 'px' : null)
      .style('bottom', under ? null : window.innerHeight - event.y + 'px')
      .style('left', onRight ? event.x + 'px' : null)
      .style('right', onRight ? null : window.innerWidth - event.x + 'px');

  }

  onSelectChange(): void {
    this.simulation.stop();

    this.nodes = this.resetActive(this.nodes, 0);
    this.links = this.resetActive(this.links, 0);
    // this.loggerService.log(this.nodes);

    // toggle activeNodes
    this.nodes.forEach(node => {
      if (this.isModelTypeSelected(node) && this.isModelInSelectedProcesses(node)) {
        node.active = 1;
      }
    });
    const activeNodesID: string[] = this.getActive(this.nodes).map(n => n['id']);

    // toggle active links
    this.links.forEach(link => {
      if (activeNodesID.includes(link['source']['id']) && activeNodesID.includes(link['target']['id'])) {
        link.active = 1;
      }
    });

    if (this.simulation.alpha() < 0.05) {
      this.simulation.alpha(0.05);
    }
    this.restart();
  }

  isModelTypeSelected(d: any): boolean {
    const nodeType = d['model_type'];
    let typeSelected = false;
    if (this.selectedModelTypes !== null && this.selectedModelTypes !== undefined) {
      if (this.selectedModelTypes.includes(nodeType)) {
        typeSelected = true;
      }
      if (this.selectedModelTypes.includes('Other')) {
        if (nodeType !== 'Research' && nodeType !== 'Official') {
          typeSelected = true;
        }
      }
    }
    return typeSelected;
  }

  isModelInSelectedProcesses(d: any): boolean {
    const selectedProcess: string[] = this.selectedProcess;
    const modelProcessList: string[] = (Object.values(d['processes_using_model_list']) as any).flat();
    let isModelInProcess = false;

    if (selectedProcess !== null && selectedProcess !== undefined) {
      // we calculate the intersection of the 2 array to check is the model is at least present in one selected process
      const intersection: string[] = selectedProcess.filter(m => modelProcessList.includes(m));
      if (intersection.length > 0) {
        isModelInProcess = true;
      }
      // we check if the no process box is selected and return true if the model is not linked to any process
      if (this.selectedProcess.includes('noProcess') && modelProcessList.length === 0) {
        isModelInProcess = true;
      }
    }
    return isModelInProcess;
  }

  dragged(event:any,d: any): void {
    Object.prototype.toString.call(event);
    d.fx = event.x;
    d.fy = event.y;

  }

  draggedEnd(event:any,d: any): void {
    if (!event.active) { this.simulation.alphaTarget(0); }
    d.fx = event.x;
    d.fy = event.y;
  }

  draggedStart(event:any,d: any): void {
    if (!event.active) { this.simulation.alphaTarget(0.3).restart(); }

    d.fx = d.x;
    d.fy = d.y;
  }

  getActive(objectList: any): any {
    return objectList.filter((element: any) => element['active'] === 1);
  }

  resetActive(objectList: any, value: number): any {
    objectList.forEach((element: any) => {
      element['active'] = value;
    });
    return objectList;
  }

  enterNode(enter: d3.Selection<d3.BaseType, any, d3.BaseType, any>): any {
    enter = enter.append('g')

    //draw circles
    enter.append('circle')
      .attr('r', 0)
      .style('fill', (d: any) => this.color(d))
      .style('stroke', 'black')
      .style('stroke-width', '1.5px')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .attr('r', (d: any) => this.radius(d));


    // draw labels
    enter.append('text')
      .text((d:any) => this.getNodeLabel(d))
      .attr('dx', (d: any) => this.radius(d) + 5)
      .attr('dy', '.35em')
      .attr('pointer-events', 'none')
      .attr('class', 'labels')
      .clone(true).lower()
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('pointer-events', 'none')
      .attr('class', 'labels');

    return enter;
  }

  exitNode(exit: any): any {
    return exit
      .call(exit => exit.transition()
        .duration(750)
        .ease(d3.easeLinear)
        .remove()
        .select('circle')
        .attr('r', 0));
  }

  enterLink(enter: any): any {
    enter = enter.append('g');
    enter.append('svg:path')
      .attr('class', 'link')
      .attr('marker-end', (d: any) => `url(#end-arrow-${d['type']})`)
      //  this is just to initialise the stroke, the final value is defined after the transition end
      .style('stroke-width', 0)
      .style('stroke', (d: any) => this.color(d))
      .style('stroke-linecap', 'round')
      .style('opacity', 0.6)
      .style('stroke-dasharray', (d: any) => d['type'] === 'PART_OF' ? '3, 5' : '0')
      .attr('length', 0)
      .call(enter => enter.transition()
        .duration(750)
        .ease(d3.easeLinear)
        .style('stroke-width', d => this.linkWidthScale(d['metadata']['size'])));

    return enter;

  }

  updateLink(update: any): any {
    return update;
  }

  exitLink(exit: any): any {
    return exit
      .call(exit => exit.transition()
        .duration(750)
        .ease(d3.easeLinear)
        .remove()
        .select('.link')
        .style('stroke-width', 0));
  }

  click(d: any, link: boolean):void {
    // const informationHtml = this.generateHtmlInformation(d,link)
    // this.informationPanel
    //   .html(informationHtml)
    //   .style('display', 'inline')
    //   .style('opacity', 1);

  }
}

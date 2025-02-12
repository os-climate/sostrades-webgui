import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Graphviz, graphviz } from 'd3-graphviz';
import * as d3 from 'd3';
import { transition } from 'd3-transition';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { VisualisationService } from 'src/app/services/visualisation/visualisation.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { VisualizationDiagrams } from 'src/app/models/study.model';


@Component({
  selector: 'app-visualisation-execution-sequence',
  templateUrl: './visualisation-execution-sequence.component.html',
  styleUrls: ['./visualisation-execution-sequence.component.scss']
})

export class ExecutionSequenceComponent implements OnInit {

  @ViewChild('graphviz_placeholder', { static: true }) private el: ElementRef;

  public isLoading: boolean;

  svg: d3.Selection<any, unknown, null, undefined>;
  margin: number;
  graph: Graphviz<d3.BaseType, any, d3.BaseType, any>;
  levelsToShow: number;
  template: string[];
  nodes: string[];
  links: string[];
  dotString: string;
  minLevel: number;
  maxLevel: number;
  tooltipDiv: d3.Selection<any, unknown, null, undefined>;
  disciplineColorScale: d3.ScaleOrdinal<string, string, never>;
  nodeColorScale: d3.ScaleOrdinal<string, string, never>;
  pathColor: string;
  pathColorHover: string;
  drag:any;

  constructor(
    private ontologyService: OntologyService,
    private studyCaseDataService: StudyCaseDataService,
    private visualisationService: VisualisationService,
    private snackbarService: SnackbarService
  ) { this.isLoading = true; }


  ngOnInit(): void {
    const loadedStudy = this.studyCaseDataService.loadedStudy;

    if (loadedStudy !== null && loadedStudy !== undefined) {
      if (Object.keys(loadedStudy.n2Diagram).length === 0 
        ||!Object.keys(loadedStudy.n2Diagram).includes(VisualizationDiagrams.EXECUTION_SEQUENCE)) {
        if (this.studyCaseDataService.preRequisiteReadOnlyDict.allocation_is_running) {
          this.visualisationService.getExecutionSequenceData(this.studyCaseDataService.loadedStudy.studyCase.id).subscribe({
            next: (res: any) => {
              // this.dotString = res['dotString'];
              this.nodes = res['nodes_list'];
              this.links = res['links_list'];
              this.setMinMax();
              this.initGraph();
            },
            error: (err: any) => {  
              this.isLoading = false;
              this.snackbarService.showError(err.description);
            }
          });
        } else {
          this.snackbarService.showError(`This execution sequence is not available for this study. To show it, please switch to edition mode`);
          this.isLoading = false;
        }  
      } else if (Object.keys(loadedStudy.n2Diagram).includes(VisualizationDiagrams.EXECUTION_SEQUENCE)){
        // if diagram already exists, add a timeout, if not the graphiz has an error
        setTimeout(() => {
          this.nodes = loadedStudy.n2Diagram[VisualizationDiagrams.EXECUTION_SEQUENCE]['nodes_list'];
          this.links = loadedStudy.n2Diagram[VisualizationDiagrams.EXECUTION_SEQUENCE]['links_list'];
          this.setMinMax();
          this.initGraph();
        }, 2000);
      }      
    }
  }
  

  initGraph(): void {
    d3.select(this.el.nativeElement).selectAll('svg').remove();

    // Define the div for the tooltip
    this.tooltipDiv = d3.select(this.el.nativeElement).append('div')
      .attr('class', 'tooltip')
      .style('position', 'fixed')
      .style('display', 'none')
      .style('justify-content', 'space-between')
      .style('flex-wrap', 'wrap');

    this.svg = d3.select(this.el.nativeElement).append('svg')
      .attr('class', 'graphviz-graph')
      .attr('id', 'graphviz-graph')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible')
      .style('cursor', 'default');

    this.svg.call(
      d3.zoom()
        .scaleExtent([.1, 4])
        .on('zoom', (event: any) => { this.svg.select('svg').attr('transform', event.transform); })
    );

    // init D3 drag support
    this.drag = d3.drag()
    .on('start', (event: any, d: any) => this.draggedStart(event, d))
    .on('drag', (event: any, d: any) => this.dragged(event, d))
    .on('end', (event: any, d: any) => this.draggedEnd(event, d));


    // create a light color scale and remove extreme element (too clear and too dark)
    const nodeColorsList = d3.schemeGnBu[9].concat().reverse()
    nodeColorsList.pop()

    this.nodeColorScale = d3.scaleOrdinal(nodeColorsList);
    this.disciplineColorScale = d3.scaleOrdinal(d3.schemeSet3);

    // // initialise color for node types
    // this.nodes.forEach((node:any)=> {node['type'] === 'DisciplineNode' ? this.nodeColorScale(node['disc_name']) : this.nodeColorScale(node['type'])})
    // const colorTypes = Array.from(new Set(this.nodes.map((d: any) => d['type']))).concat(Array.from(new Set(this.nodes.map((d: any) => d['disc_name']))));
    // console.log(colorTypes)

    this.pathColor = '#00205b';
    this.pathColorHover = '#005587';
    const margin = 20; // to avoid scrollbars
    const width = window.innerWidth - margin;
    const height = window.innerHeight - margin;

    this.graph = graphviz('#graphviz-graph', {
      useWorker: false,
      width,
      height,
      scale: 1,
      fit: true,
      zoom: true
    });

    this.levelsToShow = 0;
    // initialize node active state and expand / collapse possibility
    this.nodes.forEach((node: any) => {
      node['active'] = false;
      node['expandable'] = false;
      node['collapsible'] = false;
      if (
        (node['hasLinks'] === true &&
          (
            node['level'] === this.levelsToShow || (
              node['level'] < this.levelsToShow &&
              node['children'].length === 0)
          )) ||
        node['type'] === 'OutputNode') {
        node['active'] = true;
      }
      if (node['children'] !== undefined && node['children'] !== null) {
        if (node['children'].length > 0) {
          node['expandable'] = true;
        }
      }
      if (node['parent'] !== undefined && node['parent'] !== null && node['parent'] !== '') {
        node['collapsible'] = true;
      }
    });
    this.template = ['digraph {'];
    this.template.push('\t graph [rankdir="LR" label=" " labelloc="t", fontsize="16,0" tooltip=" "]');
    this.template.push('\t node [style="filled" tooltip=" "]');
    this.template.push('\t edge [style="bold" tooltip=" "]');
    this.dotString = this.constructDot();

    this.graph.on('initEnd', () => this.renderGraph(this.dotString));
  }

  renderGraph(dotString: string): void {
    this.graph
      .onerror(this.error)
      .dot(dotString)
      .transition(() => this.getTransition())
      .render()
      .on('end', () => this.addInteraction());
  }

  getTransition(): any {
    return transition()
      .ease(d3.easeLinear)
      .delay(700)
      .duration(2000);
  }

  constructDot(): string {
    let dotString = '';
    const dotStringLines = [...this.template];
    const nodesId = [];
    // add nodes
    const filteredNodes = this.getActiveNodes();
    filteredNodes.forEach(node => {
      const nodeString = this.createNodeString(node);
      dotStringLines.push(nodeString);
      nodesId.push(node['id']);
    });
    // add links
    const filteredLinks = this.links.filter((link: any) => (nodesId.indexOf(link['from']) !== -1 && nodesId.indexOf(link['to']) !== -1));
    filteredLinks.forEach(link => {
      const linkString = this.createPathString(link);
      dotStringLines.push(linkString);
    });

    // end string
    dotStringLines.push(`}`);
    dotString = dotStringLines.join('\n');
    return dotString;
  }

  createNodeString(node: any): string {
    const nodeId = node['id'];
    let line = '';
    let nodeLabel = '';
    let textColor = 'black';
    if (node['type'] === 'OutputNode') {
      line = `\t "${nodeId}" [label=" " shape="point" style="invis"]`;
    } else {
      if (node['type'] === 'DisciplineNode') {
        let modelLabel = node['disc_name'];
        if (this.ontologyService.getDiscipline(node['path']) !== null) {
          modelLabel = this.ontologyService.getDiscipline(node['path']).label;
        }
        nodeLabel = `${node['label']}\n${modelLabel}`;
      } else if (node['type'] === 'MDANode' || node['type'] === 'ParallelNode' || node['type'] === 'CouplingNode') {
        textColor = 'white';
        const labelList = [node['label'], `${node['children'].length} Sub-Nodes`];
        if (node['type'] === 'MDANode') {
          node['children'].forEach((nodeId: string) => {
            const childrenLabel = this.getNodeLabel(nodeId);
            labelList.push(childrenLabel);
          });
        }
        nodeLabel = labelList.join('\n');
      }
      const nodeColor = d3.color(node['type'] === 'DisciplineNode' ? this.disciplineColorScale(node['disc_name']) : this.nodeColorScale(node['type'])).hex();
      line = `\t "${nodeId}" [label="${nodeLabel}" fillcolor="${nodeColor}" fontcolor="${textColor}"]`;
    }
    return line;
  }

  createPathString(link: any): string {
    const linkLabel = '';
    const line = `\t "${link['from']}" -> "${link['to']}" [label="${linkLabel}" penwidth=2.0 color="${this.pathColor}"]`;
    return line;
  }

  modifyShowedLevel(plusMinus: string): void {
    const previous = this.levelsToShow;
    if (plusMinus === 'plus') {
      if (this.levelsToShow < this.maxLevel) {
        this.levelsToShow++;
      } else {
        this.levelsToShow = this.maxLevel;
      }
    }
    if (plusMinus === 'minus') {
      if (this.levelsToShow > this.minLevel) {
        this.levelsToShow--;
      } else {
        this.levelsToShow = this.minLevel;
      }
    }

    if (previous !== this.levelsToShow) {
      this.nodes.forEach((node: any) => {
        node['active'] = false;
        if (
          (node['hasLinks'] === true &&
            (
              node['level'] === this.levelsToShow ||
              (node['level'] < this.levelsToShow && node['children'].length === 0)
            ))
          || node['type'] === 'OutputNode') {
          node['active'] = true;
        }
      });
      const dot = this.constructDot();
      this.renderGraph(dot);
    }
  }

  setMinMax(): void {
    const levelList = this.nodes.map((node: any) => (node['level']));
    this.minLevel = Math.min(...levelList);
    this.maxLevel = Math.max(...levelList);
  }

  error(err: any): void {
    console.log('Caught error:', err);
  }

  addInteraction(): void {
    const drawnNodes = d3.selectAll('.node');
    drawnNodes
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        const nodeId = d3.select(event.currentTarget).selectAll('title').text().trim();
        const nodeData = this.nodes.find((node: any) => (node['id'] === nodeId));
        // const currentColor = d3.select(event.currentTarget).selectAll('ellipse').style('fill');
        const currentColor = d3.color(nodeData['type'] === 'DisciplineNode' ? this.disciplineColorScale(nodeData['disc_name']) : this.nodeColorScale(nodeData['type'])).hex();
        const darker = d3.rgb(currentColor).darker().toString();
        this.tooltip(d3.select(event.currentTarget), d, nodeData, false);
        d3.select(event.currentTarget).select('ellipse')
          .style('fill', darker);
      })
      .on('mouseout', (event: any,) => {
        this.tooltipDiv
          .style('display', 'none');
        const nodeId = d3.select(event.currentTarget).selectAll('title').text().trim();
        const nodeData = this.nodes.find((node: any) => (node['id'] === nodeId));
        // const currentColor = d3.select(event.currentTarget).selectAll('ellipse').style('fill');
        const nodeColor = d3.color(nodeData['type'] === 'DisciplineNode' ? this.disciplineColorScale(nodeData['disc_name']) : this.nodeColorScale(nodeData['type'])).hex();
        // const brighter = d3.rgb(currentColor).brighter().toString();
        d3.select(event.currentTarget).select('ellipse')
          .style('fill', nodeColor);
      })
      .on('click', (event: any) => this.expand(event))
      .on('contextmenu', (event: any) => {
        event.preventDefault();
        // react on right-clicking
        this.collapse(event);
      });

    const drawnEdges = d3.selectAll('.edge');
    drawnEdges
      .on('mouseover', (event: any, d: any) => {
        const edgeId = d3.select(event.currentTarget).selectAll('title').text().trim();
        const edgeData = this.links.find((link: any) => (link['id'] === edgeId));
        this.tooltip(d3.select(event.currentTarget), d, edgeData, true);
        d3.select(event.currentTarget).select('path')
          .style('stroke', this.pathColorHover);
      })
      .on('mouseout', (event: any) => {
        this.tooltipDiv
          .style('display', 'none');
        d3.select(event.currentTarget).select('path')
          .style('stroke', this.pathColor);
      });
    this.isLoading = false;
  }

  expand(event: any): void {
    const nodeId = d3.select(event.currentTarget).selectAll('title').text().trim();
    const nodeIndex = this.nodes.findIndex((node: any) => (node['id'] === nodeId));
    if (nodeIndex > -1) {
      this.tooltipDiv.style('display', 'none');
      if (this.nodes[nodeIndex]['expandable'] === true) {
        // de activate the current node because it will be replaced by its children
        this.nodes[nodeIndex]['active'] = false;
        // activate all children nodes
        const childrenList = this.nodes[nodeIndex]['children'];
        childrenList.forEach(childNodeId => {
          const childNodeIndex = this.nodes.findIndex((node: any) => (node['id'] === childNodeId));
          this.nodes[childNodeIndex]['active'] = false;
          if (childNodeIndex > -1) {
            if (this.nodes[childNodeIndex]['hasLinks'] === true) {
              this.nodes[childNodeIndex]['active'] = true;
            }
          }
        });
        // re draw the modified graph
        const dot = this.constructDot();
        this.renderGraph(dot);
      }
    }
  }

  collapse(event: any): void {
    const nodeId = d3.select(event.currentTarget).selectAll('title').text().trim();
    const nodeIndex = this.nodes.findIndex((node: any) => (node['id'] === nodeId));
    if (nodeIndex > -1) {
      this.tooltipDiv.style('display', 'none');
      if (this.nodes[nodeIndex]['collapsible'] === true) {
        // retrieve node parentId
        const parentNodeId = this.nodes[nodeIndex]['parent'];
        if (parentNodeId !== undefined && parentNodeId !== null && parentNodeId !== '') {
          const parentNodeIndex = this.nodes.findIndex((node: any) => (node['id'] === parentNodeId));
          const parentNodeData = this.nodes[parentNodeIndex];
          if (parentNodeData !== undefined && parentNodeData !== null && parentNodeData !== '') {
            if (this.nodes[parentNodeIndex]['hasLinks'] === true) {
              // activate parent node
              this.nodes[parentNodeIndex]['active'] = true;

              const childrenList = parentNodeData['children'];
              if (childrenList !== undefined && childrenList !== null && childrenList !== '') {
                // de activate children node
                childrenList.forEach(childNodeId => {
                  const childNodeIndex = this.nodes.findIndex((node: any) => (node['id'] === childNodeId));
                  if (childNodeIndex > -1) {
                    this.nodes[childNodeIndex]['active'] = false;
                  }
                });
              }
            }
          }
        }

        // re draw the modified graph
        const dot = this.constructDot();
        this.renderGraph(dot);
      }
    }
  }


  tooltip(selectedNode: any, d: any, nodeData: any, link: boolean): void {

    let tooltipContent = '';
    if (nodeData !== undefined) {
      if (link) {
        tooltipContent = this.getLinkTooltipContent(nodeData);
      } else {
        tooltipContent = this.getNodeTooltipContent(nodeData);
      }
    }

    const width = window.document.getElementsByClassName('graphviz-graph')[0]['clientWidth'];
    const height = window.document.getElementsByClassName('graphviz-graph')[0]['clientHeight'];
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

  getNodeLabel(nodeId: string): string {
    let nodeLabel = '';
    const nodeData = this.nodes.find((node: any) => (node['id'] === nodeId));
    if (nodeData !== undefined) {
      let modelLabel = nodeData['type'];
      if (this.ontologyService.getDiscipline(nodeData['path']) !== null) {
        modelLabel = this.ontologyService.getDiscipline(nodeData['path']).label;
      }
      nodeLabel = `${nodeData['label']} - ${modelLabel}`;
    }
    return nodeLabel;
  }

  getLinkTooltipContent(nodeData: any): string {
    let tooltipContent = '';
    const headerText = [];
    const contentText = [];
    headerText.push(`<h4>Link</h4>`);

    contentText.push(`<div><b>Model Source : </b> ${this.getNodeLabel(nodeData['from'])}</div>`);
    contentText.push(`<div><b>Model Target : </b> ${this.getNodeLabel(nodeData['to'])}</div>`);
    if (nodeData['parameters'] !== undefined && nodeData['parameters'] !== null) {
      contentText.push(`<div><b>Number of parameters : </b> ${nodeData['parameters'].length}</div>`);
      const parameterList = nodeData['parameters'];
      if (parameterList.length > 0) {
        const uniqueIdList = [];
        parameterList.sort((a, b) => a['Name'] > b['Name'] ? 1 : -1);
        contentText.push(`<div><table class="table table-condensed table-striped" style="border-spacing: 0;padding: 1px;"><thead><tr><th style="padding: 1px;">Parameters exchanged</th></tr></thead><tbody>`);
        parameterList.forEach(key => {
          if (uniqueIdList.indexOf(key) === -1) {
            const parameterDetails = this.ontologyService.getParameter(key);
            let parameterLabel = `${key.split('.')[key.split('.').length-1]}`;
            if (parameterDetails !== undefined && parameterDetails !== null) {
              if (parameterDetails.label !== undefined && parameterDetails.label !== null) {
                parameterLabel = `${parameterDetails.label}`;
              }
            }
            contentText.push(`<tr><td style="padding: 1px;">${parameterLabel}</td></tr>`);
            uniqueIdList.push(key);
          }
        });
        contentText.push(`</tbody></table></div>`);
      }
    }
    tooltipContent = headerText.concat(contentText).join('');
    return tooltipContent;
  }

  getNodeTooltipContent(nodeData: any): string {
    let tooltipContent = '';
    const headerText = [];
    const contentText = [];
    headerText.push(`<h4>${this.getNodeLabel(nodeData['id'])}</h4>`);

    if (nodeData['expandable'] === true) {
      headerText.push(`<div class="muted">Click for expand children</div>`);
    }
    if (nodeData['collapsible'] === true) {
      headerText.push(`<div class="muted">Right Click for collapse</div>`);
    }
    if (nodeData['id'] !== undefined && nodeData['id'] !== null) {
      contentText.push(`<div><b>ID: </b> ${nodeData['id']}</div>`);
    }
    if (nodeData['label'] !== undefined && nodeData['label'] !== null) {
      contentText.push(`<div><b>Instance Label: </b> ${nodeData['label']}</div>`);
    }
    if (nodeData['type'] !== undefined && nodeData['type'] !== null) {
      contentText.push(`<div><b>Model Label: </b> ${nodeData['type']}</div>`);
    }
    if (nodeData['status'] !== undefined && nodeData['status'] !== null) {
      contentText.push(`<div><b>Status: </b> ${nodeData['status']}</div>`);
    }
    if (nodeData['parent'] !== undefined && nodeData['parent'] !== null) {
      contentText.push(`<div><b>Parent Node: </b> ${this.getNodeLabel(nodeData['parent'])}</div>`);
    }
    if (nodeData['children'] !== undefined && nodeData['children'] !== null) {
      contentText.push(`<div><b>Number of children nodes: </b> ${nodeData['children'].length}</div>`);
      const childrenList = nodeData['children'];
      if (childrenList.length > 0) {
        contentText.push(`<div><table class="table table-condensed table-striped" style="border-spacing: 0;padding: 1px;"><thead><tr><th style="padding: 1px;">Children Nodes</th></tr></thead><tbody>`);
        childrenList.forEach(key => {
          const childrenLabel = this.getNodeLabel(key);
          contentText.push(`<tr><td style="padding: 1px;">${childrenLabel}</td></tr>`);
        });
        contentText.push(`</tbody></table></div>`);
      }
    }
    // if (nodeData['inLinks'] !== undefined && nodeData['inLinks'] !== null) {
    //   contentText.push(`<div><b>Number of incoming Links: </b> ${nodeData['inLinks'].length}</div>`);
    // }
    // if (nodeData['outLinks'] !== undefined && nodeData['outLinks'] !== null) {
    //   contentText.push(`<div><b>Number of outgoing Links: </b> ${nodeData['outLinks'].length}</div>`);
    // }
    tooltipContent = headerText.concat(contentText).join('');
    return tooltipContent;
  }

  getActiveNodes(): string[] {
    const filteredNodes = this.nodes.filter((node: any) => (node['active'] === true));
    return filteredNodes;
  }


  dragged(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;

  }

  draggedEnd(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  draggedStart(event: any, d: any): void {
    d.fx = d.x;
    d.fy = d.y;
  }
}

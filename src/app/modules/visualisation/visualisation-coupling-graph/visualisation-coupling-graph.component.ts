/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable quote-props */
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import * as d3 from 'd3';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { VisualisationService } from 'src/app/services/visualisation/visualisation.service';

@Component({
  selector: 'app-visualisation-coupling-graph',
  templateUrl: './visualisation-coupling-graph.component.html',
  styleUrls: ['./visualisation-coupling-graph.component.scss']
})
export class CouplingGraphComponent implements OnInit {

  @ViewChild('d3_placeholder', { static: true }) private el: ElementRef;

  public isLoading: boolean;



  constructor(private studyCaseDataService: StudyCaseDataService,
              private visualisationService: VisualisationService,
              private loggerService: LoggerService) {
    this.isLoading = true;

  }
  levelsToShow: number;
  maxLevel: number;
  minLevel: number;
  colorScale: any;
  colorScaleLevel: any;
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
  radiusScale: any;
  linkWidthScale: any;
  modelTypes = new FormControl();
  typeList: string[] = ['Research', 'Official', 'Other'];
  legendKeys: string[] = ['name', 'type', 'label', 'definition', 'level', 'total parameters', 'total private parameters', 'sub type', 'disciplineName', 'maturity', 'delivered', 'validator', ',implemented', 'originSource', 'modelType', 'validated', 'publicationDate'];
  typeLabels: any = {
    'INPUT_TO': { 'label': 'Link INPUT TO', 'active': 1 },
    'OUTPUT_OF': { 'label': 'Link OUTPUT OF', 'active': 1 },
    'DisciplineNode': { 'label': 'Discipline Node', 'active': 1 },
    'CouplingParameter': { 'label': 'Coupling Parameter', 'active': 1 },
    'PART_OF': { 'label': 'Link PART OF', 'active': 1 },
    'groupLink': { 'label': 'Link AGGREGATE', 'active': 1 },
    'parameterExchange': { 'label': 'Link PARAMETER EXCHANGE', 'active': 1 }
  };
  activeType: string[];

  ngOnInit(): void {

    const loadedStudy = this.studyCaseDataService.loadedStudy;

    if (loadedStudy !== null && loadedStudy !== undefined) {

      if (Object.keys(loadedStudy.n2Diagram).length === 0) {
        this.visualisationService.getDiagramN2Data(loadedStudy.studyCase.id).subscribe({
          next: (res: any) => {
            if (Object.keys(res).length > 0) {
              loadedStudy.n2Diagram = res;
              this.data = loadedStudy.n2Diagram;
              this.initGraph();
            }
           
            this.isLoading = false;
          },
          error: (err: any) => {
            console.log(err);
            this.isLoading = false;
          }
        });
      } else {
        this.data = loadedStudy.n2Diagram;
        this.initGraph();
        this.isLoading = false;
      }
    }
  }

  initGraph(): void {
    this.modelTypes.setValue(this.typeList);

    if ((this.data !== null) &&
        (this.data !== undefined)) {

      // initialize node and links visibility
      this.nodes = this.data.treeNodes.map((node: any) => {
        node['active'] = 1;
        node['Type'] === 'DisciplineNode' ? node['expand'] = 1 : null;
        return node;
      });
      this.links = this.data.groupedLinks.map((link: any) => {
        link['active'] = 1;
        return link;
      });

      this.maxLevel = Math.max(...this.nodes.map(node => {
        if (node['Type'] === 'DisciplineNode') {
          return node['Level'];
        }
      }));
      this.minLevel = Math.min(...this.nodes.map(node => {
        if (node['Type'] === 'DisciplineNode') {
          return node['Level'];
        }
      }));

      const width = 1000;
      const height = 1000;

      d3.select(this.el.nativeElement).selectAll('svg').remove();

      // Define the div for the tooltip
      this.tooltipDiv = d3.select(this.el.nativeElement).append('div')
        .attr('class', 'tooltip')
        .style('position', 'fixed')
        .style('display', 'none')
        .style('justify-content', 'space-between')
        .style('flex-wrap', 'wrap');

      this.svg = d3.select(this.el.nativeElement).append('svg')
        .attr('class', 'd3-graph')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('overflow', 'visible');

      this.radiusScale = d3.scaleLinear()
        .domain([0, 200])
        .range([5, 50])
        .clamp(true);

      this.linkWidthScale = d3.scaleLinear()
        .domain([0, 200])
        .range([2, 50])
        .clamp(true);

      this.colorScale = d3.scaleOrdinal(d3.schemeSet2);
      this.colorScaleLevel = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 6]);
      // this.colorScaleLevel =d3.scaleOrdinal(d3.schemeBlues);
      this.types = Array.from(new Set(this.nodes.map((d: any) => d['Type']))).concat(Array.from(new Set(this.links.map((d: any) => d['Type']))));
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
        // .attr("refX", 10)
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
        // .attr("refX", 10)
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
          .on('zoom', (event: any) => { this.container.attr('transform', event.transform); })
      );

      this.simulation = d3.forceSimulation()
        // .force('link', d3.forceLink().id((d: any) => d['id']).distance(100).strength(d => 1 / d['metadata']['size']))
        .force('link', d3.forceLink().id((d: any) => d['id']).distance((d: any) => this.linkDistance(d)))
        .force('charge', d3.forceManyBody().strength(-2000))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('x', d3.forceX(width / 2).strength(0.3))
        .force('y', d3.forceY(height / 2).strength(0.3))
        .on('tick', () => this.tick());

      // handles to link and node element groups
      this.container.append('svg:g').attr('fill', 'none').attr('class', 'links');
      this.container.append('svg:g').attr('class', 'nodes');


      // init D3 drag support
      this.drag = d3.drag()
      .on('start', (event: any, d: any) => this.draggedStart(event, d))
      .on('drag', (event: any, d: any) => this.dragged(event, d))
      .on('end', (event: any, d: any) => this.draggedEnd(event, d));

      // Add Legend
      this.svg.append('g').attr('class', 'legend');
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
        .style('cursor', 'pointer')
        .html(
          d => {
            let label = d;
            if (d in this.typeLabels) {
              label = this.typeLabels[d]['label'];
            }

            return `<circle r="5" stroke="black" stroke-width="1px" fill="${this.color({ 'Type': d, 'Level': 10 })}"></circle>` +
              `<text transform="translate(8,2.5)">${label}</text>`;
          }
        )
        .on('click', (event: any, d: any) => this.toggleTypeShowHide(event, d));

      this.restart();
      this.levelsToShow = 2;
      this.showOnlyLevels(this.levelsToShow, this.maxLevel);
    }

  }

  tick(): void {

    // draw directed edges with proper padding from node centers
    // console.log(this.container.select('.links').selectAll('.link'))
    this.container.select('.links').selectAll('.link').attr('d', (d: any) => {
      if (d.target.id !== d.source.id) {
        // if it is not a self referencing link
          const deltaX = d.target.x - d.source.x;
          const deltaY = d.target.y - d.source.y;

          const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          const normX = deltaX / dist;
          const normY = deltaY / dist;
          const sourcePadding = this.radius(d.source);
          const targetPadding = this.radius(d.target);

          const sourceX = d.source.x + (sourcePadding * normX);
          const sourceY = d.source.y + (sourcePadding * normY);

          const targetX = d.target.x - (1.3 * targetPadding * normX);
          const targetY = d.target.y - (1.3 * targetPadding * normY);

          const r = Math.hypot(deltaX, deltaY);
          const theta = Math.atan2(deltaY, deltaX);

          const targetX2 = (r - targetPadding) * Math.cos(theta) + d.source.x;
          const targetY2 = (r - targetPadding) * Math.sin(theta) + d.source.y;

          if (d['Type'] === 'parameterExchange') {
            // arc path
            return `
            M${sourceX},${sourceY}
            A${r},${r} 0 0,1 ${targetX},${targetY}
            `;

          } else {
            //straight path
            return `M${sourceX},${sourceY}L${targetX},${targetY}`;
          }

        } else {
          // it is a self referencing link
          // Fiddle with this angle to get loop oriented.
          const xRotation = -45;

          // Needs to be 1.
          const largeArc = 1;

          // Change sweep to change orientation of loop.
          const sweep = 1;

          // Make drx and dry different to get an ellipse
          // instead of a circle.
          const drx = 30;
          const dry = 20;

          // For whatever reason the arc collapses to a point if the beginning
          // and ending points of the arc are the same, so kludge it.
          const padding = this.radius(d.source);

          const sourceX = d.source.x + padding;
          const sourceY = d.source.y + padding;
          const targetX = d.target.x + padding + 1;
          const targetY = d.target.y + padding + 1;

          return `M${sourceX},${sourceY}A${drx},${dry} ${xRotation},${largeArc},${sweep} ${targetX},${targetY}`;
      }
    });

    this.container.select('.nodes').selectAll('g').attr('transform', (d) => `translate(${d.x},${d.y})`);
  }

  restart(): void {

    // draw links
    this.path = this.container
      .select('.links')
      .selectAll('g')
      .data(this.getActive(this.links), function(d) { return d ? d.id : this.id; })
      .join(
        enter => this.enterLink(enter),
        update => this.updateLink(update),
        exit => this.exitLink(exit),
      )
      .on('mouseover', (event: any, d: any) => {
        const darker = d3.rgb(this.color(d)).darker().toString();
        d3.select(event.currentTarget).select('.link')
          .style('stroke', darker)
          .attr('marker-end', (d: any) => `url(#end-arrow-hover-${d['Type']})`);
        this.tooltip(d, true);
      })
      .on('mouseout', (event: any, d: any) => {
        this.tooltipDiv
          .style('display', 'none');
        d3.select(event.currentTarget).select('.link')
          .style('stroke', (d: any) => this.color(d))
          .attr('marker-end', (d: any) => `url(#end-arrow-${d['Type']})`);
      });

    // updates node
    this.circle = this.container
      .select('.nodes')
      .selectAll('g')
      .data(this.getActive(this.nodes), function(d) { return d ? d.id : this.id; })
      .join(
        enter => this.enterNode(enter),
        update => this.updateNode(update),
        exit => this.exitNode(exit),
      )
      .call(this.drag)
      .on('mouseover', (event: any, d: any) => {
        const darker = d3.rgb(this.color(d)).darker().toString();
        d3.select(event.currentTarget).select('circle')
          .style('fill', darker);
        this.tooltip(d, false);

        try {
          // construct the ID of the treenode to visualise it when mouvover
          const treeViewButtons = d3.selectAll('body .tree-container');
          const buttonID = '#' + d['id'].replace(/\./g, '_');
          treeViewButtons.select(buttonID)
            .style('background', this.color(d));
        }
        catch (err) {
          this.loggerService.log(err);
        }
      })
      .on('mouseout', (event: any, d: any) => {
        this.tooltipDiv
          .style('display', 'none');
        d3.select(event.currentTarget).select('circle')
          .style('fill', this.color(d));
        try {
          // construct the ID of the treenode to visualise it when mouvover
          const treeViewButtons = d3.selectAll('body .tree-container');
          const buttonID = '#' + d['id'].replace(/\./g, '_');
          treeViewButtons.select(buttonID)
            .style('background', 'none');
        }
        catch (err) {
          this.loggerService.log(err);
        }
      })
      .on('click', (event: any, d: any) => this.click(event, d));
    // .on("dblclick", (d: any, i: any, node: any) =>  this.click(d,i,node));


    // set the graph in motion
    this.simulation
      .nodes(this.getActive(this.nodes))
      .force('link').links(this.getActive(this.links));

    this.simulation.restart();

    // this.loggerService.log(this.getActive(this.links))
  }

  radius(node: any): number {
    let radius = this.radiusScale(1);
    if ('Total Parameters' in node) {
      radius = this.radiusScale(node['Total Parameters']);
    }
    if ('expand' in node) {
      if (node.expand === 0 && 'childrenIDs' in node) {
        // if node is collapsed, add total parameters of all its children
        const childrenList = node['childrenIDs'];
        let index = 0;
        if (childrenList !== undefined && childrenList !== null) {
          if (childrenList.length > 0) {
            childrenList.forEach(id => {
              index = this.nodes.findIndex(n => n.id === id);
              if ('Total Parameters' in this.nodes[index]) {
                radius += this.nodes[index]['Total Parameters'];
              }
            });
          }
        }

      }
      radius = this.radiusScale(radius);
    }
    return radius;
  }

  tooltip(node: any, link: boolean) {

    let tooltipContent = '';
    const headerText = [];
    const contentText = [];
    if (link) {
      headerText.push(`<h4>Link</h4>`);

      contentText.push(`<div><b>Model Source : </b> ${node['source']['id']}</div>`);
      contentText.push(`<div><b>Model Target : </b> ${node['target']['id']}</div>`);
      contentText.push(`<div><b>Link Type : </b> ${node['Type']}</div>`);
      if (node['Size'] !== undefined && node['Size'] !== null) {
        contentText.push(`<div><b>Number of parameters : </b> ${node['Size']}</div>`);
      }
      if (node['Type'] === 'parameterExchange') {
        const parameterList = node['parameterList'];
        if (parameterList.length > 0) {
          const uniqueIdList = [];
          parameterList.sort((a, b) => a['Name'] > b['Name'] ? 1 : -1);
          contentText.push(`<div><table class="table table-condensed table-striped" style="border-spacing: 0;padding: 1px;"><thead><tr><th style="padding: 1px;">Parameters exchanged</th></tr></thead><tbody>`);
          parameterList.forEach(key => {
            if (uniqueIdList.indexOf(key['id']) === -1) {
              contentText.push(`<tr><td style="padding: 1px;">${key['Name']}</td></tr>`);
              uniqueIdList.push(key['id']);
            }
          });
          contentText.push(`</tbody></table></div>`);
        }
      }
    } else {
      if (node['label'] !== undefined && node['label'] !== null) {
        headerText.push(`<h4>${node['label'] + ' - ' + this.getNodeLabel(node)}</h4>`);
      }
      else {
        headerText.push(`<h4>${this.getNodeLabel(node)}</h4>`);
      }
      if (node['expandable'] === 1) {
        headerText.push(`<div class="muted">Click for expand / collapse</div>`);
      }
      if (node['Name'] !== undefined && node['Name'] !== null) {
        contentText.push(`<div><b>Name: </b> ${node['Name']}</div>`);
      }
      if (node['id'] !== undefined && node['id'] !== null) {
        contentText.push(`<div><b>ID: </b> ${node['id']}</div>`);
      }
      Object.keys(node).forEach(k => {
        if (this.legendKeys.includes(k.toLowerCase()) && k !== 'Name' && k !== 'id' && node[k] !== null) {
          contentText.push(`<div><b>${k}: </b> ${node[k]}</div>`);
        }
      });
    }

    tooltipContent = headerText.concat(contentText).join('');

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

  getNodeLabel(node: any): string {
    if (node['Name'] !== undefined && node['Name'] !== null) {
      return node['Name'];
    } else {
      return node['id'];
    }
  }

  dragged(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;

  }

  draggedEnd(event: any, d: any): void {
    if (!event.active) { this.simulation.alphaTarget(0); }
    d.fx = event.x;
    d.fy = event.y;
  }

  draggedStart(event: any, d: any): void {
    if (!event.active) { this.simulation.alphaTarget(0.3).restart(); }

    d.fx = d.x;
    d.fy = d.y;
  }

  getActive(objectList: any): any {
    return objectList.filter((element: any) => element['active'] === 1);
  }

  resetActive(objectList: any): any {
    const resetList = objectList.map((element: any) => {
      element['active'] = 1;
      return element;
    });
    return resetList;
  }

  color(d: any): any {
    if (d['Type'] === 'DisciplineNode') {
      // if (d['expandable']===0) {
      //   return  d3.rgb(this.colorScale(d['Type'])).brighter(1).toString();
      // } else {
      //   return this.colorScale(d['Type']);
      // }
      return this.colorScaleLevel(d['Level']);
    } else {
      return this.colorScale(d['Type']);
    }
  }

  enterNode(enter: any): any {
    enter = enter.append('g');

    //draw circles
    enter.append('circle')
      .attr('r', 0)
      .style('fill', (d: any) => this.color(d))
      .style('stroke', 'black')
      .style('stroke-width', '1.5px')
      .style('cursor', d => 'expandable' in d ? (d['expandable'] === 1 ? 'pointer' : 'default') : 'default')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .attr('r', (d: any) => this.radius(d));

    // draw labels
    enter.append('text')
      .text((d: any) => {
        if (d['label'] !== undefined && d['label'] !== null) {
          return d['label'] + ' - ' + this.getNodeLabel(d);
        } else {
          return this.getNodeLabel(d);
        }
      })
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

  updateNode(update: any): any {
    update.select('circle')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .attr('r', (d: any) => this.radius(d));

    update.selectAll('text')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .attr('dx', (d: any) => this.radius(d) + 5);

    return update;
  }

  enterLink(enter: any): any {
    enter = enter.append('g');
    enter.append('svg:path')
      .attr('class', 'link')
      .attr('marker-end', (d: any) => `url(#end-arrow-${d['Type']})`)
      .style('stroke-width', 0)
      .style('stroke', (d: any) => this.color(d))
      .style('stroke-linecap', 'round')
      .style('opacity', 0.6)
      .style('stroke-dasharray', (d: any) => d['Type'] === 'PART_OF' ? '3, 5' : '0')
      .attr('length', 0)
      .call(enter => enter.transition()
        .duration(750)
        .ease(d3.easeLinear)
        // .style('stroke-width', d => d['Size'] ? (d['Type'] === 'parameterExchange' ? d['Size'] : d['Size']) : 1));
        .style('stroke-width', d => this.linkWidthScale(d['Size'])));

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

  click(event: any, d: any): any {
    const nType = d['Type'];
    const nId = d['id'];

    if (nType === 'CouplingParameter') {
      const sourceNodes = this.links.filter(link => (link['Type'] === 'OUTPUT_OF' && link.target.id === nId)).map(l => l.source.id);
      const targetNodes = this.links.filter(link => (link['Type'] === 'INPUT_TO' && link.source.id === nId)).map(l => l.target.id);
      const concernedParameterNodes = [];

      //  find all parameterNodes concerned by the source and target disciplines
      this.links.forEach(link => {
        if (link['Type'] === 'OUTPUT_OF' && sourceNodes.concat(targetNodes).includes(link.source.id)) {
          concernedParameterNodes.push(link.target.id);
        }
        if (link['Type'] === 'INPUT_TO' && sourceNodes.concat(targetNodes).includes(link.target.id)) {
          concernedParameterNodes.push(link.source.id);
        }
      });
      // we hide the parameters nodes concerned
      let index = 0;
      concernedParameterNodes.forEach(id => {
        index = this.links.findIndex(l => l.id === id);
        // this.links[index].active = 0;
      });

      // sourceNodes.forEach(sNode => {
      //   targetNodes.forEach(tNode => {
      //     this.links.push({'id': sNode+'_TO_'+tNode+'_groupLink',
      //     'source': sNode,
      //     'target': tNode,
      //     'type': 'groupLink',
      //     'active':1,
      //     'metadata': 5
      //     })
      //   })
      // })

    } else if (nType === 'DisciplineNode') {
      this.toggleTreeNode(d);
    }
    this.updateNodesAndLinks();
    this.restart();
  }

  toggleTreeNode(d: any): any {
    d.expand === 0 ? this.expandNode(d) : this.collapseNode(d);
  }

  updateNodesAndLinks(): any {
    //  Update hierarchy links and parameter links
    const activeNodes = this.getActive(this.nodes).map(n => n.id);

    // we first remove all collapsedTemporaryLinks
    this.links = this.links.filter((element: any) => element['subtype'] !== 'collapsedTemporaryLink');

    // we go through all links and activate those where both source and target are active
    this.links.forEach(link => {
      if (link['Type'] === 'PART_OF' || link['Type'] === 'parameterExchange') {
        // we check if the link type is active
        if (this.typeLabels[link['Type']]['active'] === 1) {
          link.active = 0;
          if (activeNodes.includes(link.source.id) && activeNodes.includes(link.target.id)) {
            link.active = 1;
          }
        }
      }
    });

    //  we then go through the unactive links to create the necessary new links
    if (this.typeLabels['parameterExchange']['active'] === 1) {
      const collapseLinks = {};
      const unactiveLinks = this.links.filter((element: any) => element['active'] === 0 && element['Type'] === 'parameterExchange');
      if (unactiveLinks.length > 0) {
        unactiveLinks.forEach(link => {
          let newSource = link.source.id;
          let newTarget = link.target.id;
          if (!activeNodes.includes(link.source.id)) {
            newSource = link['sourceAncestors'].find(ancestor => activeNodes.includes(ancestor));
          }
          if (!activeNodes.includes(link.target.id)) {
            newTarget = link['targetAncestors'].find(ancestor => activeNodes.includes(ancestor));
          }
          if (newSource !== newTarget) {
            // this.loggerService.log('need to create a new link between ' + newSource + ' and ' + newTarget);
            const keyToCopy = ['Size', 'Type', 'groupedLinks', 'groupedNodes', 'parameterList'];
            const newLink = Object.keys(link).reduce((object, key) => {
              if (keyToCopy.includes(key)) {
                object[key] = link[key];
              }
              return object;
            }, {});
            newLink['id'] = newSource + '_TO_' + newTarget;
            newLink['source'] = newSource;
            newLink['target'] = newTarget;
            newLink['subtype'] = 'collapsedTemporaryLink';
            newLink['active'] = 1;

            if (newLink['id'] in collapseLinks) {
              collapseLinks[newLink['id']]['Size'] += link['Size'];
              collapseLinks[newLink['id']]['parameterList'] = this.mergeArrays(link['parameterList'], collapseLinks[newLink['id']]['parameterList']);
              collapseLinks[newLink['id']]['groupedLinks'] = this.mergeArrays(link['groupedLinks'], collapseLinks[newLink['id']]['groupedLinks']);
              collapseLinks[newLink['id']]['groupedNodes'] = this.mergeArrays(link['groupedNodes'], collapseLinks[newLink['id']]['groupedNodes']);
            } else {
              collapseLinks[newLink['id']] = newLink;
            }
          }
        });
        if (Object.keys(collapseLinks).length > 0) {
          // we push the newly created links into the links collection
          this.links.push(...Object.values(collapseLinks));
        }
      }
    }
  }

  mergeArrays(array1: any, array2: any): any {

    // construct a unique list of ids present in array2
    const uniqueArray2 = [];
    const idListArray2 = [];
    array2.forEach(element => {
      if (typeof element === 'string') {
        if (idListArray2.indexOf(element) === -1) {
          idListArray2.push(element);
          uniqueArray2.push(element);
        }
      } else if (typeof element === 'object') {
        if ('id' in element) {
          if (idListArray2.indexOf(element['id']) === -1) {
            idListArray2.push(element['id']);
            uniqueArray2.push(element);
          }
        }
      }
    });

    // loop through array1 and add element that are not present in array2
    array1.forEach(element => {
      if (typeof element === 'string') {
        if (!(element in idListArray2)) {
          idListArray2.push(element);
          uniqueArray2.push(element);
        }
      } else if (typeof element === 'object') {
        if (!(element['id'] in idListArray2)) {
          idListArray2.push(element['id']);
          uniqueArray2.push(element);
        }
      }
    });
    return uniqueArray2;
  }

  showOnlyLevels(level: number, previous: number): any {
    if (previous !== level) {
      if (previous < level) {
        // expand all nodes except those with a level less than defined
        // this.loggerService.log('going to loop throu node to expand them')
        this.nodes.forEach(node => {
          if (node['Level'] <= level) {
            if (node.expand === 0) {
              this.expandNode(node);
            }
          }
        });
      } else if (previous > level) {
        // deactivate all nodes except those with a level less than defined
        this.nodes.forEach(node => {
          if (node['Level'] === level + 1) {
            this.collapseNode(node);
          }
        });
      }
      this.updateNodesAndLinks();
      this.restart();
    }
  }

  collapseNode(node: any): void {
    if (node.expand === 1) {
      const childrenList = node['childrenIDs'];
      let index = 0;
      if (childrenList !== undefined && childrenList !== null) {
        if (childrenList.length > 0) {
          childrenList.forEach(id => {
            index = this.nodes.findIndex(n => n.id === id);
            this.nodes[index].active = 0;
            this.nodes[index].expand = 0;
          });
        }
      }
    }
    node.expand = 0;
  }

  expandNode(node: any): void {
    const parentLevel = node['Level'];
    if (node.expand === 0) {
      const childrenList = node['childrenIDs'];
      let index = 0;
      if (childrenList !== undefined && childrenList !== null) {
        if (childrenList.length > 0) {
          childrenList.forEach(id => {
            index = this.nodes.findIndex(n => n.id === id);
            if (this.nodes[index]['Level'] === parentLevel + 1) {
              this.nodes[index].active = 1;
            }
          });
        }
      }
    }
    node.expand = 1;
  }

  linkDistance(d: any): any {
    let distance = 0;
    if (d['Type'] === 'parameterExchange') {
      distance = d['Size'] * 50;
    } else if (d['Size']) {
      distance = d['Size'] * 50;
    } else {
      distance = 200;
    }
    if (distance < 50) {
      return 50;
    } else if (distance > 250) {
      return 250;
    } else {
      return distance;
    }
  }

  modifyShowedLevel(plusMinus: string): void {
    const previous = this.levelsToShow;
    if (plusMinus === 'plus') {
      this.levelsToShow++;
    }
    if (plusMinus === 'minus') {
      this.levelsToShow--;
    }
    if ((this.levelsToShow + 1) > this.maxLevel) {
      this.levelsToShow = this.maxLevel - 1;
    }
    if ((this.levelsToShow + 1) < this.minLevel) {
      this.levelsToShow = this.minLevel - 1;
    }
    if (previous !== this.levelsToShow) {
      this.showOnlyLevels(this.levelsToShow, previous);
    }
  }

  toggleTypeShowHide(event: any, typeToToggle: string): void {
    // toggle the state
    const state = this.typeLabels[typeToToggle]['active'] === 1 ? 0 : 1;
    this.typeLabels[typeToToggle]['active'] = state;

    const legendToggle = d3.select(event.currentTarget);
    legendToggle.select('circle')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .style('fill', (d: any) => state === 0 ? d3.rgb(this.color({ 'Type': d, 'Level': 10 })).brighter().toString() : d3.rgb(this.color({ 'Type': d, 'Level': 10 })).toString());

    legendToggle.select('text')
      .transition()
      .duration(750)
      .ease(d3.easeLinear)
      .style('text-decoration', (d: any) => state === 0 ? 'line-through' : '')
      .style('color', (d: any) => state === 0 ? 'lightgrey' : 'black');

    this.nodes.forEach(node => {
      if ('Type' in node) {
        if (node['Type'] === typeToToggle) {
          node.active = state;
        }
      }
    });
    this.links.forEach(node => {
      if ('Type' in node) {
        if (node['Type'] === typeToToggle) {
          node.active = state;
        }
      }
    });

    this.updateNodesAndLinks();
    this.restart();
  }

}

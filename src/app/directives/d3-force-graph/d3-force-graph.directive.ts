import { Directive, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { HttpClient } from '@angular/common/http';
import { scaleDiverging } from 'd3';
import { discardPeriodicTasks } from '@angular/core/testing';

@Directive({
  selector: '[appD3ForceGraph]'
})
export class D3ForceGraphDirective {

  constructor(private el: ElementRef,
              private http: HttpClient) {

    d3.json('assets/coupling_matrix_d3.json').then(data => this.createForceGraph(data));

  }

  createForceGraph(data) {

    const width = 800;
    const height = 600;

    const svg = d3.select(this.el.nativeElement).append('svg')
      .attr('width', width)
      .attr('height', height);

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 13)
      .attr('markerHeight', 13)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const container = svg.append('g');

    svg.call(
      d3.zoom()
        .scaleExtent([.1, 4])
        .on('zoom', (event:any) => { container.attr('transform', event.transform); })
    );

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const nodes = data.nodes;
    const links = data.links;


    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d['id']).distance(50).strength(1))
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(1))
      .force('y', d3.forceY(height / 2).strength(1));


    const link = container.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)');

    const node = container.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')

    // Define the div for the tooltip
    const div = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    const circles = node.append('circle')
      .attr('r', d => d['type'] === 'model' ? 20 : 5)
      .attr('fill', d => color(d['type']))
      .call(d3.drag()
        .on('start', (event:any,d:any) => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }
          d['fx'] = d['x'];
          d['fy'] = d['y'];
        })
        .on('drag', (event:any,d:any) => {
          d['fx'] = event.x;
          d['fy'] = event.y;
        })
        .on('end', (event:any,d:any) => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          d['fx'] = null;
          d['fy'] = null;
        }))
      .on('mouseover', (event:any,d:any) => {

        let tooltip = '';
        if (d['metadata'] !== undefined && d['metadata'] !== null && Object.keys(d['metadata']).length > 0) {
          const legends = [];

          Object.keys(d['metadata']).forEach(k => {
            legends.push(`<p>${k} : ${d['metadata'][k]}</p>`);
          });

          tooltip = legends.join('\n');

        } else {
          tooltip = d['id']
        }

        div.transition()
          .duration(200)
          .style('opacity', 0.9);
        div.html(tooltip)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', d => {
        div.transition()
          .duration(500)
          .style('opacity', 0);
      });

    node.append('text')
      .text(d => {
        let label: string = d['id'];

        if (d['metadata'] !== undefined && d['metadata'] !== null && Object.keys(d['metadata']).length > 0) {
          if (d['metadata']['label'] !== undefined && d['metadata']['label'] !== null && d['metadata']['label'] !== '') {
            label = d['metadata']['label'];
          }
        }
        return label;
      })
      .attr('x', d => d['type'] === 'model' ? 20 : 12)
      .attr('y', 3);
    /*
    node.append('title').append('b')
        .text(d => {

          if (d['metadata'] !== undefined && d['metadata'] !== null) {
            const legends = [];

            Object.keys(d['metadata']).forEach (k => {
              legends.push(`${k} : ${d['metadata'][k]}`);
            });

            return legends.join('\n');

          } else {
            return d['title']
          }
        });
        */
    simulation
      .nodes(nodes)
      .on('tick', () => {
        link
          .attr('x1', d => d['source']['x'])
          .attr('y1', d => d['source']['y'])
          .attr('x2', d => d['target']['x'])
          .attr('y2', d => d['target']['y']);

        node
          .attr('transform', d => {
            return 'translate(' + d['x'] + ',' + d['y'] + ')';
          });
      });
  }
}

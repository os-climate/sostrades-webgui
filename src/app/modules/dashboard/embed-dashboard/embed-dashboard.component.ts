import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { GridsterConfig } from "angular-gridster2";
import { Dashboard, DashboardGraph, DisplayableItem } from "../../../models/dashboard.model";
import { Subscription } from "rxjs";
import { TypeCheckingTools } from "../../../tools/type-checking.tool";

@Component({
  selector: 'app-embed-dashboard',
  templateUrl: './embed-dashboard.component.html',
  styleUrls: ['./embed-dashboard.component.scss']
})
export class EmbedDashboardComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription;
  private sectionExpansionSubscription: Subscription;
  private previousPositions: string;

  @Input() studyId: number;
  public dashboard: DisplayableItem[];
  public loading: boolean;
  public error: any;
  public options: GridsterConfig;

  // Getter that returns the graph items of the dashboard
  itemType: { [K in DisplayableItem['type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text'
  }

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService
  ) {
    this.options = {
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
      gridType: 'scrollVertical',
      displayGrid: 'none',
      minCols: 40,
      minRows: 16,
      maxCols: 40,
      maxRows: 400,
      margin: 1,
    }
    this.routeSubscription = null;
    this.sectionExpansionSubscription = null;
    this.loading = true;
    this.dashboard = [];
    this.error = null;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const idRequested = params['id'];
      if (idRequested !== null && idRequested !== undefined && TypeCheckingTools.isInt(idRequested)) {
        this.dashboardService.getDashboard(idRequested).subscribe((dashboard: Dashboard) => {
          this.dashboard = dashboard.items;
          this.loading = false;
        });
      } else {
        this.error = 'Study ID is required';
        this.loading = false;
      }
    });
    this.sectionExpansionSubscription = this.dashboardService.onSectionExpansion.subscribe((item: DisplayableItem) => {
      this.itemResize(item);
      this.onAutoFit();
    });
    this.previousPositions = JSON.stringify(this.dashboard.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
  }

  ngOnDestroy() {
    if ((this.routeSubscription !== null) && (this.routeSubscription !== undefined))
      this.routeSubscription.unsubscribe();
    if ((this.sectionExpansionSubscription !== null) && (this.sectionExpansionSubscription !== undefined))
      this.sectionExpansionSubscription.unsubscribe();

  }

  // Calculate the width of the graph item for resizing
  CalculateGraphWidth(item: DashboardGraph): number {
    const colWidth = this.getColWidth();
    if (!colWidth) return null;
    return (item.cols * colWidth) + ((item.cols - 1) * this.options.margin);
  }

  // Calculate the height of the graph item for resizing
  CalculateGraphHeight(item: DashboardGraph): number {
    const rowHeight = this.getRowHeight();
    if (!rowHeight) return null;
    return (item.rows * rowHeight) + ((item.rows - 1) * this.options.margin);
  }

  // get the width of the column
  getColWidth(): number {
    const columnElement = document.querySelector('.gridster-column');
    if (columnElement) {
      return parseFloat(getComputedStyle(columnElement).width);
    }
  }

  // get the height of the row
  getRowHeight(): number {
    const rowElement = document.querySelector('.gridster-row');
    if (rowElement) {
      return parseFloat(getComputedStyle(rowElement).height);
    }
  }

  itemResize(item: DisplayableItem) {
    if (item.minCols && item.minRows) {
      if (item.cols < item.minCols) {
        // check if the item after recalibration will stay on the valid grid
        // if not, set the item's x to the maximum x position based on the options.maxCols minus item.minCols (to avoid grid to be extended)
        if (item.x + item.minCols > this.options.maxCols) {
          item.x = this.options.maxCols - item.minCols;
        }
        JSON.parse(this.previousPositions).forEach(i => {
          if (item.x + item.minCols > i.x && item.x < i.x + i.cols && item.y + item.rows > i.y && item.y < i.y + i.rows && item.id !== i.id)
            item.x = i.x - item.minCols;
        });
        item.cols = item.minCols;
      }
      if (item.rows < item.minRows) {
        // check if the item after recalibration will not collide with another item
        // if not, set the item's y to the maximum y position based on the other item colliding y and the item.minRows (to avoid items to overlap)
        JSON.parse(this.previousPositions).forEach(i => {
          if (item.y + item.minRows > i.y && item.y < i.y + i.rows && item.x + item.cols > i.x && item.x < i.x + i.cols && item.id !== i.id)
            item.y = i.y - item.minRows
        });
        item.rows = item.minRows;
      }
    }

    if (this.options.api) this.options.api.optionsChanged();
  }

  onAutoFit() {
    this.dashboard = this.autoFitItems(this.dashboard);
    this.options.compactType = 'none'
    if (this.options.api) this.options.api.optionsChanged();
  }

  autoFitItems(items: DisplayableItem[]) {
    const ColsWidth = 40;
    const placed: DisplayableItem[] = [];

    for (const item of items) {
      let found = false;
      for (let y = 0; !found; y++) {
        for (let x = 0; x <= ColsWidth - item.cols; x++) {
          // Check if there is a collision with an already placed item
          const collision = placed.some(other =>
            x < other.x + other.cols &&
            x + item.cols > other.x &&
            y < other.y + other.rows &&
            y + item.rows > other.y
          );
          if (!collision) {
            item.x = x;
            item.y = y;
            placed.push(item);
            found = true;
            break;
          }
        }
      }
    }
    this.checkForPositionChanges();
    return placed;
  }
  checkForPositionChanges() {
    const currentPositions = JSON.stringify(this.dashboard.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
    if (currentPositions !== this.previousPositions) {
      this.orderItemsByPosition();
      this.previousPositions = JSON.stringify(this.dashboard.map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        cols: item.cols,
        rows: item.rows
      })));
    }
  }

  // Change the dashboard list of the component to match the new order of the items in the grid
  orderItemsByPosition() {
    this.dashboard.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });
  }

}

import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  HostListener,
  ChangeDetectorRef,
  ViewChild,
  QueryList, ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { LoadedStudy } from 'src/app/models/study.model';
import { DashboardService } from "../../services/dashboard/dashboard.service";
import {
  Dashboard,
  DashboardGraph,
  DashboardSection,
  DashboardText,
  DisplayableItem
} from "../../models/dashboard.model";
import { GridsterConfig } from "angular-gridster2";
import { MatSlideToggle, MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SnackbarService } from "../../services/snackbar/snackbar.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridsterItem') gridsterItems: QueryList<ElementRef>;

  private treeNodeDataSubscription: Subscription;
  private dashboardAddItemSubscription: Subscription;
  private dashboardRemoveItemSubscription: Subscription;
  private dashboardUpdateItemSubscription: Subscription;
  private sectionExpansionSubscription: Subscription;
  public loadedStudy: LoadedStudy;
  public dashboardFavorites: DisplayableItem[];
  public isDashboardUpdated: boolean;
  public options: GridsterConfig;
  private previousPositions: string;
  public isDashboardInEditionMode: boolean;

  // Getter that returns the graph items of the dashboard
  itemType: { [K in DisplayableItem['type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text'
  }

  constructor(
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    private snackbarService: SnackbarService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef) {
    this.loadedStudy = null;
    this.dashboardFavorites = [];
    this.isDashboardUpdated = this.dashboardService.isDashboardChanged;
    this.isDashboardInEditionMode = false;
    this.options = {
      draggable: {
        enabled: false,
        ignoreContent: true,
        dragHandleClass: 'drag-handle',
        dropOverItems: true,
        stop: this.onDragStop.bind(this),
      },
      resizable: {
        enabled: false,
        stop: this.onResizeStop.bind(this),
      },
      itemResizeCallback: this.onItemResize.bind(this),
      enableEmptyCellDrop: true,
      gridType: 'scrollVertical',
      displayGrid: 'none',
      minCols: 10,
      minRows: 4,
      maxCols: 10,
      maxRows: 100,
      margin: 4,
      swap: true,
      swapWhileDragging: true
    }
  }

  ngOnInit() {
    this.treeNodeDataSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(() => {
      this.loadedStudy = this.studyCaseDataService.loadedStudy;
    });
    this.dashboardAddItemSubscription = this.dashboardService.onDashboardItemsAdded.subscribe((item: DisplayableItem) => {
      this.dashboardFavorites.push(item);
      this.isDashboardUpdated = true;
    });
    this.dashboardRemoveItemSubscription = this.dashboardService.onDashboardItemsRemoved.subscribe((item: DisplayableItem) => {
      this.dashboardFavorites = this.dashboardFavorites.filter(existing => existing.id !== item.id);
      this.isDashboardUpdated = true;
    });
    this.dashboardUpdateItemSubscription = this.dashboardService.onDashboardItemsUpdated.subscribe((item: DisplayableItem) => {
      const index = this.dashboardFavorites.findIndex(existing => existing.id === item.id);
      if (index !== -1) {
        this.dashboardFavorites[index] = item;
        this.isDashboardUpdated = true;
      }
      if (this.options.api) this.options.api.optionsChanged();
    });
    this.sectionExpansionSubscription = this.dashboardService.onSectionExpansion.subscribe(() => {
      this.onAutoFit();
    })
    this.dashboardFavorites = this.dashboardService.getItems();
    this.isDashboardInEditionMode = this.dashboardService.isDashboardInEditionMode;
    this.previousPositions = JSON.stringify(this.dashboardFavorites.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
    if (this.isDashboardInEditionMode) this.toggleEdit();
    if (this.options.api) this.options.api.optionsChanged();
  }

  ngAfterViewInit() {
    this.updateGraphSizes();
    if (this.options.api) this.options.api.optionsChanged();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
    if ((this.dashboardAddItemSubscription !== null) && (this.dashboardAddItemSubscription !== undefined)) {
      this.dashboardAddItemSubscription.unsubscribe();
    }
    if ((this.dashboardRemoveItemSubscription !== null) && (this.dashboardRemoveItemSubscription !== undefined)) {
      this.dashboardRemoveItemSubscription.unsubscribe();
    }
    if ((this.dashboardUpdateItemSubscription !== null) && (this.dashboardUpdateItemSubscription !== undefined)) {
      this.dashboardUpdateItemSubscription.unsubscribe();
    }
  }

  // Handle the edition mode switch (draggable, resizable and display grid)
  toggleEdit() {
    this.options.draggable.enabled = !this.options.draggable.enabled;
    this.options.resizable.enabled = !this.options.resizable.enabled;
    this.dashboardService.isDashboardInEdition = this.options.draggable.enabled;
    this.options.displayGrid = this.options.draggable.enabled ? 'always' : 'none';
    if (this.options.api) this.options.api.optionsChanged();
  }

  // Handle the mat-slide-toggle inside the button when the user clicks the button
  handleEditButtonClick(toggle: MatSlideToggle) {
    toggle.toggle();
    this.toggleEdit();
  }

  // Handle the mat-slide-toggle change event
  onSlideToggleChange(event: MatSlideToggleChange) {
    this.options.resizable.enabled = event.checked;
    this.options.draggable.enabled = event.checked;
    this.toggleEdit();
  }

  // Save the current dashboard in a backend file
  OnSaveDashboard() {
    const dashboard: Dashboard = {
      'studyCaseId': this.loadedStudy.studyCase.id,
      'items': this.dashboardFavorites,
    }
    this.dashboardService.updateDashboard(dashboard).subscribe({
      next: () => {
        this.snackbarService.showInformation('Dashboard saved');
        this.isDashboardUpdated = false;
      },
      error: (err) => {
        this.snackbarService.showError(`Error saving dashboard: ${err}`);
      }
    });
    this.options.draggable.enabled = false;
    this.options.resizable.enabled = false;
    this.options.displayGrid = 'none';
    if (this.dashboardFavorites.length > 0)
      this.options.api.optionsChanged();
  }

  // Custom compact function to fil the empty spaces in the dashboard
  autoFitItems(items: DisplayableItem[]) {
    const ColsWidth = 10;
    let rowHeight = 1;
    let currentX = 0;
    let currentY = 0;
    const itemReOrdered: DisplayableItem[] = [];

    for (const item of items) {
      if (currentX + item.cols > ColsWidth) {
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }
      item.x = currentX;
      item.y = currentY;
      itemReOrdered.push(item);
      rowHeight = Math.max(rowHeight, item.rows);
      currentX += item.cols;
    }
    this.checkForPositionChanges();
    return itemReOrdered;
  }

  // Handle the auto-fit button click and change the compact type to none
  onAutoFit() {
    this.dashboardFavorites = this.autoFitItems(this.dashboardFavorites);
    this.options.compactType = 'none'
    if (this.options.api) this.options.api.optionsChanged();
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

  // Listen for window resize event
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateGraphSizes();
  }

  // Used to trigger Angular's change detection
  updateGraphSizes() {
    this.dashboardFavorites = [...this.dashboardFavorites];
  }

  // Handle the drag stop event
  onDragStop() {
    setTimeout(() => {
      this.checkForPositionChanges();
    }, 0);
  }

  // Handle the resize stop event
  onResizeStop() {
    setTimeout(() => {
      this.checkForPositionChanges();
    }, 0);
  }

  onItemResize(item: DisplayableItem) {
    setTimeout(() => {
      this.itemResize(item);
    }, 0)
  }

  // Handle the item resize event
  itemResize(item: DisplayableItem) {
    if (item.minCols && item.minRows) {
      if (item.cols < item.minCols) {
        this.snackbarService.showError(`${item.type} item must have at least ${item.minCols} columns`);
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
        this.snackbarService.showError(`${item.type} item must have at least ${item.minRows} rows`);
        // check if the item after recalibration will not collide with another item
        // if not, set the item's y to the maximum y position based on the other item colliding y and the item.minRows (to avoid items to overlap)
        JSON.parse(this.previousPositions).forEach(i => {
          if (item.y + item.minRows > i.y && item.y < i.y + i.rows && item.x + item.cols > i.x && item.x < i.x + i.cols && item.id !== i.id)
            item.y = i.y - item.minRows
        });
        item.rows = item.minRows;
      }
    }
    if (item.type === 'section') {
      if ((<DashboardSection>item).maxRows) {
        if (item.rows > (<DashboardSection>item).maxRows) {
          this.snackbarService.showError(`${item.type} item must have at most ${(<DashboardSection>item).maxRows} rows`);
          item.rows = (<DashboardSection>item).maxRows;
        }
      }
    }

    if (this.options.api) this.options.api.optionsChanged();
  }

  // check if the position of the items has changed
  checkForPositionChanges() {
    const currentPositions = JSON.stringify(this.dashboardFavorites.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
    if (currentPositions !== this.previousPositions) {
      this.orderItemsByPosition();
      this.previousPositions = JSON.stringify(this.dashboardFavorites.map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        cols: item.cols,
        rows: item.rows
      })));
      this.isDashboardUpdated = true;
    }
  }

  // Change the dashboard list of the component to match the new order of the items in the grid
  orderItemsByPosition() {
    this.dashboardFavorites.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });
  }

  // Add a new text item to the dashboard
  onAddText() {
    const text = new DashboardText();
    this.dashboardService.addItem(text);
  }
  // Add a new section item to the dashboard
  onAddSection() {
    const section = new DashboardSection();
    this.dashboardService.addItem(section);
  }
}

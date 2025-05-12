import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
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

  private treeNodeDataSubscription: Subscription;
  private dashboardAddItemSubscription: Subscription;
  private dashboardRemoveItemSubscription: Subscription;
  private dashboardUpdateItemSubscription: Subscription;
  public hasDashboard: boolean;
  public loadedStudy: LoadedStudy;
  public dashboardFavorites: DisplayableItem[];
  public isDashboardUpdated: boolean;
  public options: GridsterConfig;
  private previousPositions: string;

  constructor(
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    private snackbarService: SnackbarService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef) {
    this.loadedStudy = null;
    this.dashboardFavorites = [];
    this.isDashboardUpdated = this.dashboardService.isDashboardChanged;
    this.options = {
      draggable: {
        enabled: false,
        ignoreContentClass: 'gridster-item-content',
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
    });
    this.dashboardFavorites = this.dashboardService.getItems();
    if (this.options.api)
      this.options.api.optionsChanged();
    this.previousPositions = JSON.stringify(this.dashboardFavorites.map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
  }

  ngAfterViewInit() {
    this.updateGraphSizes();
    if (this.options.api) {
      this.options.api.optionsChanged();
    }
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
    this.options.displayGrid = this.options.draggable.enabled ? 'always' : 'none';
    this.options.api.optionsChanged();
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
    this.options.api.optionsChanged();
  }

  // Getter that returns the graph items of the dashboard
  get graphItems(): DashboardGraph[] {
    return this.dashboardFavorites.filter(item => item.type === 'graph') as DashboardGraph[];
  }

  // Getter that returns the text items of the dashboard
  get textItems(): DashboardText[] {
    return this.dashboardFavorites.filter(item => item.type === 'text') as DashboardText[];
  }

  // Getter that returns the section items of the dashboard
  get sectionItems(): DashboardSection[] {
    return this.dashboardFavorites.filter(item => item.type === 'section') as DashboardSection[];
  }

  // Custom compact function to fil the empty spaces in the dashboard
  autoFitItems(items: DisplayableItem[]) {
    // this.dashboardFavorites.forEach((item: DisplayableItem, index) => {
    //   console.log(`Item ${index}: ${item.id}, x: ${item.x}, y: ${item.y}, cols: ${item.cols}, rows: ${item.rows}`);
    // })
    const ColsWidth = 10;
    let rowHeight = 3;
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
    this.options.api.optionsChanged();
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
        item.cols = item.minCols;
      }
      if (item.rows < item.minRows) {
        this.snackbarService.showError(`${item.type} item must have at least ${item.minRows} rows`);
        item.rows = item.minRows;
      }
    }
    this.options.api.optionsChanged();
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
    const text = new DashboardText('Click to edit this text');
    this.dashboardService.addItem(text);
  }

  // Add a new section item to the dashboard
  onAddSection() {
    const section = new DashboardSection('<p>Section title</p>');
    this.dashboardService.addItem(section);
  }
}



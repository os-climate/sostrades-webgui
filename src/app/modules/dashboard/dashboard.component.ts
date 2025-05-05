import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadedStudy } from 'src/app/models/study.model';
import {DashboardService} from "../../services/dashboard/dashboard.service";
import { Dashboard, DashboardGraph, DashboardText, DisplayableItem } from "../../models/dashboard.model";
import { GridsterConfig } from "angular-gridster2";
import { MatSlideToggle, MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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
      // to remove
      this.hasDashboard = this.loadedStudy.dashboard !== null &&
        this.loadedStudy.dashboard !== undefined &&
        ('rows' in this.loadedStudy.dashboard || 'title' in this.loadedStudy.dashboard);
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
      console.log(item.data)
      this.isDashboardUpdated = true;
    })
    this.dashboardFavorites = this.dashboardService.getItems();
    if (this.options.api)
      this.options.api.optionsChanged();
    this.previousPositions = JSON.stringify(this.dashboardFavorites.map(item => ({ id: item.id, x: item.x, y: item.y, cols: item.cols, rows: item.rows })));
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

  toggleEdit() {
    this.options.draggable.enabled = !this.options.draggable.enabled;
    this.options.resizable.enabled = !this.options.resizable.enabled;
    this.options.displayGrid = this.options.draggable.enabled ? 'always' : 'none';
    this.options.api.optionsChanged();
  }

  handleEditButtonClick(toggle: MatSlideToggle) {
    toggle.toggle();
    this.toggleEdit();
  }

  onSlideToggleChange(event: MatSlideToggleChange) {
    this.options.resizable.enabled = event.checked;
    this.options.draggable.enabled = event.checked;
    this.toggleEdit();
  }

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

  isGraph(item: DisplayableItem): item is DashboardGraph {
    return item.type === 'graph'
  }

  get graphItems(): DashboardGraph[] {
    return this.dashboardFavorites.filter(item => this.isGraph(item)) as DashboardGraph[];
  }

  isText(item: DisplayableItem): item is DashboardText {
    return item.type === 'text'
  }

  get textItems(): DashboardText[] {
    return this.dashboardFavorites.filter(item => this.isText(item)) as DashboardText[];
  }

  autoFitItems(items: DisplayableItem[]) {
    this.dashboardFavorites.forEach((item: DisplayableItem, index) => {
      console.log(`Item ${index}: ${item.id}, x: ${item.x}, y: ${item.y}, cols: ${item.cols}, rows: ${item.rows}`);
    })
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

  onAutoFit() {
    this.dashboardFavorites = this.autoFitItems(this.dashboardFavorites);
    this.options.compactType = 'none'
    this.options.api.optionsChanged();
  }

  getGraphWidth(item: DashboardGraph): number {
    const colWidth = this.calculateColWidth();
    if (!colWidth) return null;
    return (item.cols * colWidth) + ((item.cols - 1) * this.options.margin);
  }

  getGraphHeight(item: DashboardGraph): number {
    const rowHeight = this.calculateRowHeight();
    if (!rowHeight) return null;
    return (item.rows * rowHeight) + ((item.rows - 1) * this.options.margin);
  }

  calculateColWidth(): number {
    const columnElement = document.querySelector('.gridster-column');
    if (columnElement) {
      return parseFloat(getComputedStyle(columnElement).width);
    }
  }

  calculateRowHeight(): number {
    const rowElement = document.querySelector('.gridster-row');
    if (rowElement) {
      return parseFloat(getComputedStyle(rowElement).height);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateGraphSizes();
  }

  updateGraphSizes() {
    this.dashboardFavorites = [...this.dashboardFavorites];
  }

  onDragStop() {
   setTimeout(() => {
    this.checkForPositionChanges();
   }, 0);
  }

  onResizeStop() {
    setTimeout(() => {
      this.checkForPositionChanges();
    }, 0);
  }

  checkForPositionChanges() {
    const currentPositions = JSON.stringify(this.dashboardFavorites.map(item => ({ id: item.id, x: item.x, y: item.y, cols: item.cols, rows: item.rows })));
    if (currentPositions !== this.previousPositions) {
      console.log('Positions changed');
      this.dashboardFavorites.forEach((item: DisplayableItem, index) => {
        console.log(`Item ${index}: ${item.id}, x: ${item.x}, y: ${item.y}, cols: ${item.cols}, rows: ${item.rows}`);
      })
      this.orderItemsByPosition();
      this.previousPositions = JSON.stringify(this.dashboardFavorites.map(item => ({ id: item.id, x: item.x, y: item.y, cols: item.cols, rows: item.rows })));
      this.isDashboardUpdated = true;
    } else {
      console.log('Positions not changed');
      this.dashboardFavorites.forEach((item: DisplayableItem, index) => {
        console.log(`Item ${index}: ${item.id}, x: ${item.x}, y: ${item.y}, cols: ${item.cols}, rows: ${item.rows}`);
      })
    }
  }

  orderItemsByPosition() {
    this.dashboardFavorites.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });
  }

  onAddText() {
    // problem might occur when deleting the first one in a list of 2 texts and then re adding a new one it will be created with the same id as the remaining one text-1
    // fix should be incrementing the id of the new text by 1
    const textItemLen: number = this.textItems.length;
    const id = `text-${textItemLen}`;
    const text = new DashboardText(id, 'Click to edit this text');
    this.dashboardService.addTextItem(text);
  }
}

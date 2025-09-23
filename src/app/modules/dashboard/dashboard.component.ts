import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  QueryList,
  ElementRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TreeNodeDataService } from 'src/app/services/tree-node-data.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { LoadedStudy } from 'src/app/models/study.model';
import { DashboardService } from "../../services/dashboard/dashboard.service";
import {
  ItemLayout,
  ItemData,
  DashboardItemFactory, Dashboard, TextData, GraphData, SectionData, ValueData
} from "../../models/dashboard.model";
import { GridsterConfig } from "angular-gridster2";
import { MatSlideToggle, MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SnackbarService } from "../../services/snackbar/snackbar.service";
import { NodeData } from 'src/app/models/node-data.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridsterItem') gridsterItems: QueryList<ElementRef>;

  private treeNodeDataSubscription: Subscription;
  private updatedDashboardSubscription: Subscription;
  private dashboardAddItemSubscription: Subscription;
  private dashboardRemoveItemSubscription: Subscription;
  private dashboardUpdateItemSubscription: Subscription;
  private sectionExpansionSubscription: Subscription;
  public loadedStudy: LoadedStudy;
  public isDashboardUpdated: boolean;
  public options: GridsterConfig;
  private previousPositions: string;
  public isDashboardInEditionMode: boolean;
  public showDashboard: boolean; // Property to control component recreation

  // Getter that returns the type string
  itemType: { [K in ItemLayout['item_type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text',
    value_data: 'value_data'
  }

  constructor(
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    private snackbarService: SnackbarService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef) {
    this.loadedStudy = null;
    this.isDashboardUpdated = this.dashboardService.isDashboardChanged;
    this.isDashboardInEditionMode = false;
    this.initializeGridsterOptions();
    this.showDashboard = true;
  }

  private initializeGridsterOptions() {
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
      minCols: 40,
      minRows: 16,
      maxCols: 40,
      maxRows: 400,
      margin: 1,
      swap: true,
    };
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.isDashboardInEditionMode = this.dashboardService.isDashboardInEditionMode;
    this.savePreviousPositions();
    if (this.isDashboardInEditionMode) this.toggleEdit();
    
    // Emit the initial dashboard edition mode state
    this.dashboardService.onDashboardEditionModeChanged.emit(this.dashboardService.isDashboardInEdition);
    
    if (this.options.api) this.options.api.optionsChanged();
  }

  private setupSubscriptions() {
    this.treeNodeDataSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(() => {
      this.loadedStudy = this.studyCaseDataService.loadedStudy;
    });

    this.updatedDashboardSubscription = this.dashboardService.onDashboardUpdated.subscribe(() => {
       console.log('Dashboard update received, recreating component...');
       
       // Simulate ngDestroy/ngOnInit cycle by toggling the component
       this.showDashboard = false;
       
       // Re-create the component after Angular has destroyed it
       setTimeout(() => {
         this.showDashboard = true;
         this.setEditMode(false);
         // Reinitialize gridster options
         this.initializeGridsterOptions();
         this.cdr.detectChanges();
         console.log('Dashboard component recreated');
       }, 50);
    });
    this.dashboardAddItemSubscription = this.dashboardService.onDashboardItemsAdded.subscribe((item: {
      layout: ItemLayout,
      data: ItemData
    }) => {
      console.log('Dashboard item added: ', item);
      this.isDashboardUpdated = true;
    });

    this.dashboardRemoveItemSubscription = this.dashboardService.onDashboardItemsRemoved.subscribe((itemId: string) => {
      console.log('Dashboard item removed: ', itemId);
      this.isDashboardUpdated = true;
    });

    this.dashboardUpdateItemSubscription = this.dashboardService.onDashboardItemsUpdated.subscribe((item: {
      layout: ItemLayout,
      data: ItemData
    }) => {
      console.log('Dashboard item updated: ', item);
      if (this.options.api) this.options.api.optionsChanged();
      this.isDashboardUpdated = true;
    });

    this.sectionExpansionSubscription = this.dashboardService.onSectionExpansion.subscribe((itemLayout: ItemLayout) => {
      this.itemResize(itemLayout);
      this.onAutoFit();
    });
  }

  private savePreviousPositions() {
    if (this.dashboardService.currentDashboard && this.dashboardService.currentDashboard.layout) {
      this.previousPositions = JSON.stringify(Object.values(this.dashboardService.currentDashboard.layout).map((item: ItemLayout) => ({
        item_id: item.item_id,
        x: item.x,
        y: item.y,
        cols: item.cols,
      rows: item.rows
      })));
    }
  }

  get dashboard(): Dashboard {
    return this.dashboardService.currentDashboard
  }

  getItemLayout(id: string): ItemLayout | null {
    return this.dashboardService.currentDashboard.layout[id] || null;
  }

  getGraphData(id: string): GraphData {
    return this.dashboardService.currentDashboard.data[id] as GraphData;
  }

  getValueData(id: string) {
    const value: ItemLayout = this.dashboardService.currentDashboard.layout[id];
    const valueData: ValueData = this.dashboardService.getDataAsValue(this.dashboardService.currentDashboard.data[id]);
    if (value && valueData) {
      return { layout: value, data: valueData };
    }
  }

  getDisplayItems(): string[] {
    if (this.dashboardService.currentDashboard && this.dashboardService.currentDashboard.layout){
      return Object.keys(this.dashboardService.currentDashboard.layout);
    }
    return [];
  }

  getTextData(id: string): TextData {
    return this.dashboardService.currentDashboard.data[id] as TextData;
  }

  getSectionItem(id: string): { layout: ItemLayout, data: SectionData } {
    const section: ItemLayout = this.dashboardService.currentDashboard.layout[id];
    const sectionData: SectionData = this.dashboardService.currentDashboard.data[id] as SectionData;
    if (section && sectionData) {
      return { layout: section, data: sectionData };
    }
  }

  ngAfterViewInit() {
    // this.updateGraphSizes();
    if (this.options.api) this.options.api.optionsChanged();
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
    if ((this.updatedDashboardSubscription !== null) && (this.updatedDashboardSubscription !== undefined)) {
      this.updatedDashboardSubscription.unsubscribe();
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
    if ((this.sectionExpansionSubscription !== null) && (this.sectionExpansionSubscription !== undefined)) {
      this.sectionExpansionSubscription.unsubscribe();
    }
  }

  // Handle the edition mode switch (draggable, resizable and display grid)
  toggleEdit() {
    this.options.draggable.enabled = !this.options.draggable.enabled;
    this.options.resizable.enabled = !this.options.resizable.enabled;
    this.dashboardService.isDashboardInEdition = this.options.draggable.enabled;
    this.dashboardService.onDashboardEditionModeChanged.emit(this.options.draggable.enabled);
    this.options.displayGrid = this.options.draggable.enabled ? 'always' : 'none';
    if (this.options.api) this.options.api.optionsChanged();
  }

  setEditMode(isEditMode: boolean) {
    if (this.options.draggable.enabled !== isEditMode) {
      this.toggleEdit();
    }
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
    this.dashboardService.updateDashboard(this.loadedStudy.studyCase.id).subscribe({
      next: () => {
        this.snackbarService.showInformation('Dashboard saved');
        this.isDashboardUpdated = false;
      },
      error: (err) => {
        let errorMessage = err.message || 'Unknown error';
        if (err.error && err.error.description) {
          errorMessage = err.error.description
        }
        this.snackbarService.showError(`Error saving dashboard: ${errorMessage}`);
      }
    });
  }

  // Custom compact function to fil the empty spaces in the dashboard
  autoFitItems(itemsLayout: ItemLayout[]): ItemLayout[] {
    const placed: ItemLayout[] = [];
    for (const itemLayout of itemsLayout) {
      let found = false;
      for (let y = 0; !found; y++) {
        for (let x = 0; x <= this.options.maxCols - itemLayout.cols; x++) {
          // Check if there is a collision with an already placed item
          const collision = placed.some((other: ItemLayout): boolean => {
            return (x < other.x + other.cols &&
              x + itemLayout.cols > other.x &&
              y < other.y + other.rows &&
              y + itemLayout.rows > other.y)
          });
          if (!collision) {
            itemLayout.x = x;
            itemLayout.y = y;
            placed.push(itemLayout);
            found = true;
            break;
          }
        }
      }
    }
    this.checkForPositionChanges();
    return placed;
  }

  // Handle the auto-fit button click and change the compact type to none
  onAutoFit() {
    let itemsLayout: ItemLayout[] = [];
    for (const itemId of this.getDisplayItems()) {
      const itemLayout: ItemLayout = this.getItemLayout(itemId);
      itemsLayout.push(itemLayout);
    }
    itemsLayout = this.autoFitItems(itemsLayout);
    itemsLayout.forEach((item: ItemLayout)=> {
      this.dashboardService.currentDashboard.layout[item.item_id] = item;
    })
    this.options.compactType = 'none'
    if (this.options.api) this.options.api.optionsChanged();
  }

  // Calculate the width of the graph item for resizing
  calculateGraphWidth(item: ItemLayout): number {
    const colWidth = this.getColWidth();
    if (!colWidth) return null;
    return (item.cols * colWidth) + ((item.cols - 1) * this.options.margin);
  }

  // Calculate the height of the graph item for resizing
  calculateGraphHeight(item: ItemLayout): number {
    const rowHeight = this.getRowHeight();
    if (!rowHeight) return null;
    return (item.rows * rowHeight) + ((item.rows - 1) * this.options.margin);
  }

  // Calculate the width of the widget item for resizing
  calculateWidgetWidth(item: ItemLayout): number {
    const colWidth = this.getColWidth();
    if (!colWidth) return null;
    return (item.cols * colWidth) + ((item.cols - 1) * this.options.margin);
  }

  // Calculate the height of the widget item for resizing
  calculateWidgetHeight(item: ItemLayout): number {
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

  onItemResize(item: ItemLayout) {
    setTimeout(() => {
      this.itemResize(item);
    }, 0)
  }

  // Handle the item resize event
  itemResize(item_layout: ItemLayout) {
    if (item_layout.minCols && item_layout.minRows) {
      if (item_layout.cols < item_layout.minCols) {
        this.snackbarService.showError(`${item_layout.item_type} item must have at least ${item_layout.minCols} columns`);
        // check if the item after recalibration will stay on the valid grid
        // if not, set the item's x to the maximum x position based on the options.maxCols minus item.minCols (to avoid grid to be extended)
        if (item_layout.x + item_layout.minCols > this.options.maxCols) {
          item_layout.x = this.options.maxCols - item_layout.minCols;
        }
        JSON.parse(this.previousPositions).forEach((i: {item_id: string, x: number, y: number, cols: number, rows: number}) => {
          if (item_layout.x + item_layout.minCols > i.x && item_layout.x < i.x + i.cols && item_layout.y + item_layout.rows > i.y && item_layout.y < i.y + i.rows && item_layout.item_id !== i.item_id)
            item_layout.x = i.x - item_layout.minCols;
        });
        item_layout.cols = item_layout.minCols;
      }
      if (item_layout.rows < item_layout.minRows) {
        this.snackbarService.showError(`${item_layout.type} item must have at least ${item_layout.minRows} rows`);
        // check if the item after recalibration will not collide with another item
        // if not, set the item's y to the maximum y position based on the other item colliding y and the item_layout.minRows (to avoid items to overlap)
        JSON.parse(this.previousPositions).forEach((i: {item_id: string, x: number, y: number, cols: number, rows: number}) => {
          if (item_layout.y + item_layout.minRows > i.y && item_layout.y < i.y + i.rows && item_layout.x + item_layout.cols > i.x && item_layout.x < i.x + i.cols && item_layout.item_id !== i.item_id)
            item_layout.y = i.y - item_layout.minRows
        });
        item_layout.rows = item_layout.minRows;
      }
    }
    if (this.options.api) this.options.api.optionsChanged();
  }

  // check if the position of the items has changed
  checkForPositionChanges() {
    const currentPositions = JSON.stringify(Object.values(this.dashboardService.currentDashboard.layout).map((item: ItemLayout): {item_id: string, x: number, y: number, cols: number, rows: number}  => ({
      item_id: item.item_id,
      x: item.x,
      y: item.y,
      cols: item.cols,
      rows: item.rows
    })));
    if (currentPositions !== this.previousPositions) {
      this.orderItemsByPosition();
      this.savePreviousPositions();
      this.isDashboardUpdated = true;
    }
  }

  // Change the dashboard list of the component to match the new order of the items in the grid
  orderItemsByPosition() {
    Object.values(this.dashboardService.currentDashboard.layout).sort((a: ItemLayout, b: ItemLayout) => {
      if (a.y === b.y) {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });
  }

  // Add a new text item to the dashboard
  onAddText() {
    const newText = DashboardItemFactory.createText();
    this.dashboardService.addItem(newText);
  }

  // Add a new section item to the dashboard
  onAddSection() {
    const newSection = DashboardItemFactory.createSection();
    this.dashboardService.addItem(newSection);
  }

  deleteUnavailableItem(itemId: string) {
    this.dashboardService.removeItem(itemId);
  }
}



import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ItemLayout, ItemData, SectionData, GraphData, TextData, ValueData } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { QuillEditorComponent } from "ngx-quill";
import { MatDialog } from "@angular/material/dialog";
import { DashboardTextDialogComponent } from "../dashboard-text-dialog/dashboard-text-dialog.component";
import { DashboardSectionDialogComponent } from "../dashboard-section-dialog/dashboard-section-dialog.component";
import { NodeData } from 'src/app/models/node-data.model';

@Component({
  selector: 'app-dashboard-section-item',
  templateUrl: './dashboard-section-item.component.html',
  styleUrls: ['./dashboard-section-item.component.scss']
})
export class DashboardSectionItemComponent implements OnInit {
  @Input() sectionItem: {layout: ItemLayout, data: SectionData};
  @Input() inEditionMode: boolean;
  @ViewChild(QuillEditorComponent, { static: false }) quillEditor: QuillEditorComponent;

  itemType: { [K in ItemLayout['item_type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text',
    value_data: 'value_data'
  }

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!this.sectionItem.data.title)
      this.sectionItem.data.title = '';
  }

  startEditingTitle() {
    if (this.inEditionMode) {
      const dialogRef = this.dialog.open(DashboardTextDialogComponent, {
        width: '600px',
        height: '400px',
        data: { content: this.sectionItem.data.title }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.sectionItem.data.title = result;
          this.dashboardService.updateItem(this.sectionItem);
        }
      });
    }
  }

  // When entering edit mode
  startEditingSection() {
    this.dialog.open(DashboardSectionDialogComponent, {
      width: '900px',
      height: '500px',
      data: {
        section: this.sectionItem,
        dashboard: {
          layout: this.dashboardService.getItemsLayout().filter((item: ItemLayout) => item.item_type !== 'section'),
          data: this.dashboardService.getItemsData()
        }
      }
    });
  }

  expandSection() {
    this.sectionItem.data.shown = !this.sectionItem.data.shown;
    if (!this.sectionItem.data.shown)
      this.sectionItem.data.expandedSize = this.sectionItem.layout.rows;
    this.sectionItem.layout.rows = this.sectionItem.data.shown ?
      (this.sectionItem.data.expandedSize || 20) : // use stored size or default
      1; // Collapse size
    this.sectionItem.layout.minRows = this.sectionItem.data.shown ? 16 : 1; // Minimum 16 when expanded, 1 when collapsed
    this.dashboardService.updateItem(this.sectionItem);
    this.dashboardService.onSectionExpansionEvent(this.sectionItem);
  }

  getHeaderHeight(): string {
    if (this.sectionItem.data.shown) {
      const percentPerRow: number = 1 / this.sectionItem.layout.rows;
      const gapAdjustment: number = (this.sectionItem.layout.rows - 1);
      if (gapAdjustment > 0)
        return `calc((100% - ${gapAdjustment}px) * ${percentPerRow})`;
      return `${percentPerRow * 100}%`;
    }
    return '100%';
  }

  // delete the text item of the dashboard and emit an event
  deleteSectionItem() {
    this.dashboardService.removeItem(this.sectionItem.layout.item_id);
  }

  getChildType(childId: string): 'text' | 'graph' | 'value_data' {
    if (this.dashboardService.isGraph(this.dashboardService.currentDashboard.data[childId])) {
      return 'graph';
    } else if (this.dashboardService.isDataValue(this.dashboardService.currentDashboard.data[childId])) {
      return 'value_data';
    }
    return 'text';
  }

  getGraphChildData(childId: string): GraphData {
    const data: ItemData = this.dashboardService.currentDashboard.data[childId];
    if ('disciplineName' in data &&
        'name' in data &&
        'plotIndex' in data &&
        'postProcessingFilters' in data &&
        'graphData' in data) {
      return data as GraphData;
    }
    return undefined;
  }

  getTextChildData(childId: string): TextData {
    const itemData: ItemData = this.dashboardService.getItemDataById(childId);
    if ('content' in itemData)
      return itemData as TextData;
    return undefined;
  }
  
  getValueData(id: string) : ValueData{
     return this.dashboardService.getDataAsValue(this.dashboardService.getItemDataById(id));
    }
}

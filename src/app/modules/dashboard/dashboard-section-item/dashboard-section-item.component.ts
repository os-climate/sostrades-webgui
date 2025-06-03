import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardSection, DisplayableItem } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { QuillEditorComponent } from "ngx-quill";
import { MatDialog } from "@angular/material/dialog";
import { DashboardTextDialogComponent } from "../dashboard-text-dialog/dashboard-text-dialog.component";
import { DashboardSectionDialogComponent } from "../dashboard-section-dialog/dashboard-section-dialog.component";

@Component({
  selector: 'app-dashboard-section-item',
  templateUrl: './dashboard-section-item.component.html',
  styleUrls: ['./dashboard-section-item.component.scss']
})
export class DashboardSectionItemComponent implements OnInit {
  @Input() sectionItem: DashboardSection;
  @Input() inEditionMode: boolean;
  @ViewChild(QuillEditorComponent, { static: false }) quillEditor: QuillEditorComponent;

  itemType: { [K in DisplayableItem['type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text'
  }

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {
  }

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
    const dialogRef = this.dialog.open(DashboardSectionDialogComponent, {
      width: '900px',
      height: '500px',
      data: { content: this.sectionItem.data.items, dashboard: this.dashboardService.getItems().filter(item => { return item.type !== 'section' }) },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.sectionItem.data.items = result;
        this.dashboardService.updateItem(this.sectionItem);
      }
    });
  }

  expandSection() {
    this.sectionItem.data.shown = !this.sectionItem.data.shown;
    if (!this.sectionItem.data.shown)
      this.sectionItem.data.expandedSize = this.sectionItem.rows;
    this.sectionItem.rows = this.sectionItem.data.shown ?
      (this.sectionItem.data.expandedSize || 5) : // use stored size or default
      1; // Collapse size
    this.sectionItem.minRows = this.sectionItem.data.shown ? 4 : 1; // Minimum 4 when expanded, 1 when collapsed
    this.sectionItem.maxRows = this.sectionItem.data.shown ? undefined : 1; // No max when expanded, 1 when collapsed
    this.dashboardService.updateItem(this.sectionItem);
    this.dashboardService.onSectionExpansionEvent();
  }

  getHeaderHeight() {
    if (this.sectionItem.data.shown) {
      const percentPerRow: number = 1 / this.sectionItem.rows;
      const gapAdjustment: number = (this.sectionItem.rows - 1) * 4; // 4px gap between rows
      if (gapAdjustment > 0)
        return `calc((100% - ${gapAdjustment}px) * ${percentPerRow})`;
      else
        return `${percentPerRow * 100}%`;
    } else {
      return '100%';
    }
  }

  // delete the text item of the dashboard and emit an event
  deleteSectionItem(text: DashboardSection) {
    this.dashboardService.removeItem(text);
  }
}

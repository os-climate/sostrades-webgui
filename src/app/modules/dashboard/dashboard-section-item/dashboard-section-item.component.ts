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

  toggleExpandSection() {
    this.sectionItem.data.shown = !this.sectionItem.data.shown;
    if (this.sectionItem.data.shown) {
      if (this.sectionItem.data.expandedSize) {
        this.sectionItem.rows = this.sectionItem.data.expandedSize;
      } else {
        this.sectionItem.rows = 5;
      }
      this.sectionItem.minRows = 4;
      this.sectionItem.maxRows = undefined;
    } else {
      this.sectionItem.data.expandedSize = this.sectionItem.rows;
      this.sectionItem.rows = 1;
      this.sectionItem.minRows = 1;
      this.sectionItem.maxRows = 1;
    }
    this.dashboardService.updateItem(this.sectionItem);
    this.dashboardService.onSectionExpansionEvent();
  }

  getHeaderHeight() {
    if (this.sectionItem.data.shown) {
      return (1 / this.sectionItem.rows) * 100;
    } else {
      return 100;
    }
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem(text: DashboardSection) {
    this.dashboardService.removeItem(text);
  }
}

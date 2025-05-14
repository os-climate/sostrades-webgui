import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardSection } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { QuillEditorComponent } from "ngx-quill";
import { MatDialog } from "@angular/material/dialog";
import { DashboardTextDialogComponent } from "../dashboard-text-dialog/dashboard-text-dialog.component";

@Component({
  selector: 'app-dashboard-section-item',
  templateUrl: './dashboard-section-item.component.html',
  styleUrls: ['./dashboard-section-item.component.scss']
})
export class DashboardSectionItemComponent implements OnInit {
  @Input() sectionItem: DashboardSection;
  @Input() inEditionMode: boolean;
  @ViewChild(QuillEditorComponent, { static: false }) quillEditor: QuillEditorComponent;

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
      })
    }
  }

  // When entering edit mode
  startEditingSection() {
    // popup to add graphs inside the section
  }

  toggleExpandSection() {
    this.sectionItem.data.shown = !this.sectionItem.data.shown;
    if (this.sectionItem.data.shown) {
      this.sectionItem.rows = 5;
    } else {
      this.sectionItem.rows = 1;
    }
    this.dashboardService.updateItem(this.sectionItem)
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem(text: DashboardSection) {
    this.dashboardService.removeItem(text);
  }
}

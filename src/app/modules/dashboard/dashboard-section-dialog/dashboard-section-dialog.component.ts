import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DisplayableItem } from "../../../models/dashboard.model";
import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { DashboardService } from "../../../services/dashboard/dashboard.service";

@Component({
  selector: 'app-dashboard-section-dialog',
  templateUrl: './dashboard-section-dialog.component.html',
  styleUrls: ['./dashboard-section-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardSectionDialogComponent {
  private DASHBOARD_LIST_ID: string = 'dashboard-list' as const;
  private SECTION_LIST_ID: string = 'section-list' as const;
  private DASHBOARD_EMPTY_LIST_ID: string = 'empty-dashboard-list' as const;
  private SECTION_EMPTY_LIST_ID: string = 'empty-section-list' as const;

  itemType: { [K in DisplayableItem['type']]: K } = {
    graph: 'graph',
    section: 'section',
    text: 'text'
  }

  constructor(
    private dashboardService: DashboardService,
    public dialogRef: MatDialogRef<DashboardSectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { content: DisplayableItem[], dashboard: DisplayableItem[]}
  ) {}

  drop(event: CdkDragDrop<DisplayableItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      if ((event.previousContainer.id === this.DASHBOARD_LIST_ID || event.previousContainer.id === this.DASHBOARD_EMPTY_LIST_ID)
        && (event.container.id === this.SECTION_LIST_ID || event.container.id === this.SECTION_EMPTY_LIST_ID))
        // add the graph to the section so remove it from the dashboard
        this.dashboardService.removeItem(event.container.data[event.currentIndex]);
      else if ((event.previousContainer.id === this.SECTION_LIST_ID || event.previousContainer.id === this.SECTION_EMPTY_LIST_ID)
        && (event.container.id === this.DASHBOARD_LIST_ID || event.container.id === this.DASHBOARD_EMPTY_LIST_ID))
        // remove the graph from the section so adding it to the dashboard
        this.dashboardService.addItem(event.container.data[event.currentIndex]);
    }
  }

  cleanText(text: string): string {
    // Remove HTML tags and replace multiple spaces with a single space
    if (!text) return 'Empty TextBox';
    return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  cancelEditing() {
    this.dialogRef.close(undefined)
  }
}

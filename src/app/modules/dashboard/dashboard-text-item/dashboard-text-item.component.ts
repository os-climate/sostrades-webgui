import { Component, Input, OnInit } from '@angular/core';
import { ItemLayout, TextData } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { MatDialog } from "@angular/material/dialog";
import { DashboardTextDialogComponent } from "../dashboard-text-dialog/dashboard-text-dialog.component";

@Component({
  selector: 'app-dashboard-text-item',
  templateUrl: './dashboard-text-item.component.html',
  styleUrls: ['./dashboard-text-item.component.scss']
})
export class DashboardTextItemComponent implements OnInit {
  @Input() textId: string;
  @Input() textItemData: TextData;
  @Input() inEditionMode: boolean;

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    if (!this.textItemData.content)
      this.textItemData.content = '';
  }

  // When entering edit mode
  startEditing() {
    if (this.inEditionMode) {
      const dialogRef = this.dialog.open(DashboardTextDialogComponent, {
        width: '600px',
        height: '400px',
        data: { content: this.textItemData.content }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.textItemData.content = result;
          this.dashboardService.updateItem({layout: null, data: this.textItemData});
        }
      });
    }
  }

  // Check if the text is in the dashboard
  isTextInDashboard(): boolean {
    return this.dashboardService.getItemsLayout().some((item: ItemLayout) => item.item_id === this.textId);
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem() {
    this.dashboardService.removeItem(this.textId);
  }
}

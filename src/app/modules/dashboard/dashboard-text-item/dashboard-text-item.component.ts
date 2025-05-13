import { Component, Input, OnInit } from '@angular/core';
import { DashboardText } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { MatDialog } from "@angular/material/dialog";
import { DashboardTextDialogComponent } from "../dashboard-text-dialog/dashboard-text-dialog.component";

@Component({
  selector: 'app-dashboard-text-item',
  templateUrl: './dashboard-text-item.component.html',
  styleUrls: ['./dashboard-text-item.component.scss']
})
export class DashboardTextItemComponent implements OnInit {
  @Input() textItem: DashboardText;
  @Input() inEditionMode: boolean;

  constructor(
    private dashboardService: DashboardService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!this.textItem.data.content)
      this.textItem.data.content = '';
  }

  // When entering edit mode
  startEditing() {
    if (this.inEditionMode) {
      const dialogRef = this.dialog.open(DashboardTextDialogComponent, {
        width: '600px',
        height: '400px',
        data: { content: this.textItem.data.content }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.textItem.data.content = result;
          this.dashboardService.updateItem(this.textItem);
        }
      })
    }
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem(text: DashboardText) {
    this.dashboardService.removeItem(text);
  }
}

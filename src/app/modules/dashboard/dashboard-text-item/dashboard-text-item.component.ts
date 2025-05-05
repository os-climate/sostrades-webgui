import { Component, Input, OnInit} from '@angular/core';
import { DashboardText } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";

@Component({
  selector: 'app-dashboard-text-item',
  templateUrl: './dashboard-text-item.component.html',
  styleUrls: ['./dashboard-text-item.component.scss']
})
export class DashboardTextItemComponent implements OnInit {
  @Input() textItem: DashboardText;
  @Input() isDraggable: boolean;

  isEditing: boolean;
  editableContent: string;

  constructor(private dashboardService: DashboardService) {
    this.isEditing = false;
    this.editableContent = '';
  }

  ngOnInit() {
    this.editableContent = this.textItem.data.content;
  }

  startEditing() {
    if (!this.isDraggable) {
      this.isEditing = true;
      this.editableContent = this.textItem.data.content;
    }
  }

  saveChanges() {
    this.textItem.data.content = this.editableContent;
    this.isEditing = false;
    this.dashboardService.onDashboardItemsUpdated.emit(this.textItem);
  }

  cancelEditing() {
    this.isEditing = false;
    this.editableContent = this.textItem.data.content;
  }

  deleteTextItem(text: DashboardText) {
    this.dashboardService.removeTextItem(text);
  }
}

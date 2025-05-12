import { Component, Input, OnInit } from '@angular/core';
import { DashboardText } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";

@Component({
  selector: 'app-dashboard-text-item',
  templateUrl: './dashboard-text-item.component.html',
  styleUrls: ['./dashboard-text-item.component.scss']
})
export class DashboardTextItemComponent implements OnInit {
  @Input() textItem: DashboardText;

  public isEditing: boolean;
  public editableContent: string;
  public editModules: any;

  constructor(private dashboardService: DashboardService) {
    this.isEditing = false;
      this.editableContent = '';
    this.editModules = {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ font: [] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
      ],
        placeholder: '',
    };
  }

  ngOnInit() {
    if (!this.textItem.data.content)
      this.textItem.data.content = '';
    this.editableContent = this.textItem.data.content;
  }

  // When entering edit mode
  startEditing() {
    this.isEditing = true;
    this.editableContent = this.textItem.data.content;
  }

  // When leaving edit mode by saving
  saveChanges() {
    this.textItem.data.content = this.editableContent;
    this.dashboardService.updateItem(this.textItem);
    this.isEditing = false;
  }

  // When leaving edit mode by canceling
  cancelEditing() {
    this.editableContent = this.textItem.data.content;
    this.isEditing = false;
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem(text: DashboardText) {
    this.dashboardService.removeItem(text);
  }
}

import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DashboardSection } from "../../../models/dashboard.model";
import { DashboardService } from "../../../services/dashboard/dashboard.service";
import { QuillEditorComponent } from "ngx-quill";

@Component({
  selector: 'app-dashboard-section-item',
  templateUrl: './dashboard-section-item.component.html',
  styleUrls: ['./dashboard-section-item.component.scss']
})
export class DashboardSectionItemComponent implements OnInit {
  @Input() sectionItem: DashboardSection;
  @ViewChild(QuillEditorComponent, { static: false }) quillEditor: QuillEditorComponent;

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
        [{ align: ['center'] }],
        ['clean'],
      ]
    };
  }

  ngOnInit() {
    if (!this.sectionItem.data.title)
      this.sectionItem.data.title = '';
    this.editableContent = this.sectionItem.data.title;
  }

  // When entering edit mode
  startEditing() {
    this.editableContent = this.sectionItem.data.title;
    console.log('startEditing: ', this.editableContent);
    this.isEditing = true;
    setTimeout(() => {
      if (this.quillEditor && this.quillEditor.quillEditor) {
        console.log('setting quill content directly: ', this.editableContent);
        this.quillEditor.quillEditor.setText('');
        if (this.editableContent && this.editableContent.trim() !== '') {
          this.quillEditor.quillEditor.clipboard.dangerouslyPasteHTML(this.editableContent);
        }
      }
    }, 0);
  }

  // When leaving edit mode by saving
  saveChanges() {
    this.sectionItem.data.title = this.editableContent;
    this.dashboardService.updateItem(this.sectionItem);
    this.isEditing = false;
  }

  // When leaving edit mode by canceling
  cancelEditing() {
    this.editableContent = this.sectionItem.data.title;
    this.isEditing = false;
  }

  // delete the text item of the dashboard and emit an event
  deleteTextItem(text: DashboardSection) {
    this.dashboardService.removeItem(text);
  }

  onEditorCreated(quill: any) {
    console.log('Editor created: ', quill);
    if (this.editableContent && this.editableContent.trim() !== '') {
      console.log('setting content on editor creation: ', this.editableContent);
      quill.clipboard.dangerouslyPasteHTML(this.editableContent);
    }
  }
}

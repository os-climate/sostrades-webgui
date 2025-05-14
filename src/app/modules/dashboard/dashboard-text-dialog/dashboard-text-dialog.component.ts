import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-dashboard-text-dialog',
  templateUrl: './dashboard-text-dialog.component.html',
  styleUrls: ['./dashboard-text-dialog.component.scss']
})
export class DashboardTextDialogComponent {
  public editableContent: string;
  public editModules: any;

  constructor(
    public dialogRef: MatDialogRef<DashboardTextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { content: string }
  ) {
    this.editableContent = data.content || '';
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

  onEditorCreated(quill: any) {
    if (this.editableContent && this.editableContent.trim() !== '') {
      quill.clipboard.dangerouslyPasteHTML(this.editableContent);
    }
  }

  saveChanges() {
    this.dialogRef.close(this.editableContent);
  }

  cancelEditing() {
    this.dialogRef.close(undefined);
  }
}

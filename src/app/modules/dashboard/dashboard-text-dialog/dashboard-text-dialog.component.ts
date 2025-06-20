import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { QuillEditorComponent } from "ngx-quill";

@Component({
  selector: 'app-dashboard-text-dialog',
  templateUrl: './dashboard-text-dialog.component.html',
  styleUrls: ['./dashboard-text-dialog.component.scss']
})
export class DashboardTextDialogComponent implements AfterViewInit {
  @ViewChild(QuillEditorComponent) quillEditor: QuillEditorComponent;
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
        [{ header: [1, 2, 3, 4, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ font: [] }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['clean'],
      ]
    };
    this.dialogRef.afterOpened().subscribe(() => {
      this.focusEditor();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.focusEditor();
    }, 100);
  }

  onEditorCreated(quill: any) {
    if (this.editableContent && this.editableContent.trim() !== '') {
      quill.clipboard.dangerouslyPasteHTML(this.editableContent);
    }
    setTimeout(() => {
      quill.focus();
    }, 0);
  }

  focusEditor() {
    if (this.quillEditor && this.quillEditor.quillEditor) {
      this.quillEditor.quillEditor.focus();
      const length = this.quillEditor.quillEditor.getLength();
      this.quillEditor.quillEditor.setSelection(length, length);
    }
  }

  saveChanges() {
    this.dialogRef.close(this.editableContent);
  }

  cancelEditing() {
    this.dialogRef.close(undefined);
  }
}

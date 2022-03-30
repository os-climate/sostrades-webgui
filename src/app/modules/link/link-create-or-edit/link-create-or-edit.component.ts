import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LinkDialogData } from 'src/app/models/dialog-data.model';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';


@Component({
  selector: 'app-link-create-or-edit',
  templateUrl: './link-create-or-edit.component.html',
  styleUrls: ['./link-create-or-edit.component.scss']
})

export class LinkCreateOrEditComponent implements OnInit {
  public linkForm: FormGroup;
  public isLoading: boolean;

  constructor(
    public dialogRef: MatDialogRef<LinkCreateOrEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LinkDialogData) {
      this.isLoading = true;
  }

  ngOnInit(): void {

    this.linkForm = new FormGroup({
      linkLabel: new FormControl(this.data.label, [Validators.required]),
      linkUrl: new FormControl(this.data.url, [Validators.required]),
      linkDescription: new FormControl(this.data.description, [Validators.required]),
    });
    this.isLoading = false;
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.linkForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.data.cancel = false;

    this.data.label = this.linkForm.value.linkLabel;
    this.data.url = this.linkForm.value.linkUrl;
    this.data.description = this.linkForm.value.linkDescription;

    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }
}

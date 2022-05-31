import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditGroupDialogData } from 'src/app/models/dialog-data.model';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit {

  public editForm : FormGroup;

  constructor(
    public dialogRef: MatDialogRef<GroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditGroupDialogData) {
  }

  ngOnInit(): void {

    this.editForm = new FormGroup({
      groupName : new FormControl(this.data.name,[Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupDescription : new FormControl(this.data.description,[Validators.required])
    })
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.editForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.data.cancel = false;
    this.data.name = this.editForm.value.groupName;
    this.data.description = this.editForm.value.groupDescription;

    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

}

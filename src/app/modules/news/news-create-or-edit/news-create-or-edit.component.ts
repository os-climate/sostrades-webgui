import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NewsDialogData } from 'src/app/models/dialog-data.model';
import { WelcomPageComponent } from 'src/app/modules/welcom-page/welcom-page.component';


@Component({
  selector: 'app-news-create-or-edit',
  templateUrl: './news-create-or-edit.component.html',
  styleUrls: ['./news-create-or-edit.component.scss']
})
export class NewsCreateOrEditComponent implements OnInit {

  public newsForm: FormGroup;
  public title: string;
  public disableForm: boolean;


  constructor(
    public dialogRef: MatDialogRef<WelcomPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewsDialogData) {
      this.disableForm = false;

  }

  ngOnInit(): void {
    this.newsForm = new FormGroup({
      message: new FormControl(this.data.message, [Validators.required]),
    });
    if (this.data.message.length > 0) {
      this.title = 'Edit news';
    } else {
        this.title = 'Add a news';
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.newsForm.controls[controlName].hasError(errorName);
  }

  public onChange() {
    this.newsForm.valueChanges.subscribe(() => {
      if (this.data.message === this.newsForm.value.message || this.newsForm.value.message.trim().length === 0 ) {
        this.disableForm = true;
      } else {
        this.disableForm = false;
      }
    });
  }
  submitForm() {
    this.data.cancel = false;

    this.data.message = this.newsForm.value.message;
    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

}

import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-management-information',
  templateUrl: './data-management-information.component.html',
  styleUrls: ['./data-management-information.component.scss']
})
export class DataManagementInformationComponent  {

  constructor(public dialogRef: MatDialogRef<DataManagementInformationComponent>) { }


  okClick() {
    this.dialogRef.close();
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-management-information',
  templateUrl: './data-management-information.component.html',
  styleUrls: ['./data-management-information.component.scss']
})
export class DataManagementInformationComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataManagementInformationComponent>) { }

  ngOnInit(): void {
  }

  okClick() {
    this.dialogRef.close();
  }
}

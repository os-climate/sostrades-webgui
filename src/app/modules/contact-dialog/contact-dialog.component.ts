import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppDataService } from 'src/app/services/app-data/app-data.service';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss']
})
export class ContactDialogComponent implements OnInit {

  public mail : string
  
  constructor( 
    public appDataService : AppDataService,
    public dialogRef: MatDialogRef<ContactDialogComponent>,
    ) 
    { }

  ngOnInit(): void {
    this.appDataService.getAppSupport().subscribe(
      result=>{
         this.mail = result['support']
      } 
    )
  }
  closeContactDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

}

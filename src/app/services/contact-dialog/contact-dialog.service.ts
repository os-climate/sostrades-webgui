import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ContactDialogComponent } from 'src/app/modules/contact-dialog/contact-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ContactDialogService {
 
  private dialogRef: MatDialogRef<ContactDialogComponent>;

  
  constructor(public dialog: MatDialog) { 
    this.dialogRef = null;
  }


 openContactDialog() {
     this.dialogRef = this.dialog.open(ContactDialogComponent, {
      width: '400px',
      height: '200px',
      
    });
  }

  closeContactDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
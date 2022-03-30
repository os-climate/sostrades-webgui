import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ContactDialogComponent } from 'src/app/modules/contact-dialog/contact-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ContactDialogService {
 

  constructor(public dialog: MatDialog) { 
  }

 openContactDialog() {
     this.dialog.open(ContactDialogComponent, {
      width: '400px',
      height: '200px',
      
    });
  }
}
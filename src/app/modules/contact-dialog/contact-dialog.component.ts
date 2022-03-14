import { Component, Inject, OnInit } from '@angular/core';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { ContactDialogService } from 'src/app/services/contact-dialog/contact-dialog.service';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.scss']
})
export class ContactDialogComponent implements OnInit {

  public mail : string
  
  constructor( 
    public appDataService : AppDataService,
    public contactDialogService : ContactDialogService
    ) 
    { }

  ngOnInit(): void {
    this.appDataService.getAppSupport().subscribe(
      result=>{
         this.mail = result['support']
      } 
    )
  }
  closeDialog(){
    this.contactDialogService.closeContactDialog()
  }
}

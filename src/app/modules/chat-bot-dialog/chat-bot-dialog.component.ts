import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig  } from '@angular/material/dialog';
import { StudyChatBotDialogData } from 'src/app/models/dialog-data.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-bot-dialog',
  templateUrl: './chat-bot-dialog.component.html',
  styleUrls: ['./chat-bot-dialog.component.scss']
})
export class ChatBotDialogComponent implements OnInit {

  public isMinimized:boolean;
  public startPosition:any;
  constructor( 
    public dialogRef: MatDialogRef<ChatBotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudyChatBotDialogData,
    ) 
    { 
      this.isMinimized = false;
    }

  ngOnInit(): void {
    this.dialogRef.afterOpened().subscribe(()=>{
      this.startPosition = this.dialogRef.componentRef.location.nativeElement.getBoundingClientRect();
    });
  }

  closeDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  minimizeDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      if (this.isMinimized){
        const rect = this.dialogRef.componentRef.location.nativeElement.getBoundingClientRect();
        this.dialogRef.updateSize("600px","800px");
        const matDialogConfig = new MatDialogConfig();
        matDialogConfig.position = {top:`${this.startPosition.top}px`, right:`0px`};
        this.dialogRef.updatePosition(matDialogConfig.position);
      
        
      }
      else{
        this.dialogRef.updateSize("600px","30px")
        const matDialogConfig = new MatDialogConfig();
        matDialogConfig.position = {top:`${this.startPosition.top + 800 -30}px`, right:`0px`};
        this.dialogRef.updatePosition(matDialogConfig.position);
      
        
      }
      this.isMinimized = !this.isMinimized;
      
    }
  }

}

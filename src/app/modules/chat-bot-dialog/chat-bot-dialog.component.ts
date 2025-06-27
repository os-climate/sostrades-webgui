import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StudyChatBotDialogData } from 'src/app/models/dialog-data.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat-bot-dialog',
  templateUrl: './chat-bot-dialog.component.html',
  styleUrls: ['./chat-bot-dialog.component.scss']
})
export class ChatBotDialogComponent {

  
  constructor( 
    public dialogRef: MatDialogRef<ChatBotDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudyChatBotDialogData,
    ) 
    { }


  closeDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

}

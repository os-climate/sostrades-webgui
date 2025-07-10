import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatBotDialogComponent } from '../../chat-bot-dialog/chat-bot-dialog.component';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { StudyChatBotDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-study-case-event-container',
  templateUrl: './study-case-event-container.component.html',
  styleUrls: ['./study-case-event-container.component.scss']
})
export class StudyCaseEventContainerComponent implements OnInit, OnDestroy{
  public showChatBotButton: boolean;
  private chatBotDialog: MatDialogRef<ChatBotDialogComponent>;

  constructor(
    public dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService
  ){
    this.showChatBotButton = false;
    this.chatBotDialog = null;
  }

  ngOnInit(): void {
     // Check if the LLM chatbot in configured, if true show the chatbot button
    this.showChatBotButton = this.isChatBotEnabled();
  }
  isChatBotEnabled(): boolean {
    // Check if the LLM chatbot is configured in the application settings
    return environment.hasOwnProperty('STUDY_LLM_URL') && environment['STUDY_LLM_URL'].trim() !== '';
  }

  openChatBot(){
    if ((this.chatBotDialog !== null && this.chatBotDialog !== undefined && this.chatBotDialog.getState() !== MatDialogState.OPEN)
    || this.chatBotDialog === null || this.chatBotDialog === undefined){
      const studyId = this.studyCaseDataService.loadedStudy.studyCase.id;
      let chatbotData = new StudyChatBotDialogData();
      chatbotData.studyName = this.studyCaseDataService.loadedStudy.studyCase.name;
      chatbotData.chatBotUrl = environment['STUDY_LLM_URL']  + '/?embed=true&study-id=' + studyId ;
      this.chatBotDialog = this.dialog.open(ChatBotDialogComponent, {
        width: '600px', 
        position: { right: '0', bottom:'0'},
        height: '800px',
        data: chatbotData,
        hasBackdrop: false
      });
    }
    else{
      this.chatBotDialog.close();
    }
  }

  ngOnDestroy(): void {
    if (this.dialog !== null && this.dialog !== undefined) {
      this.dialog.closeAll();
      this.chatBotDialog = null;
    }
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatBotDialogComponent } from '../../chat-bot-dialog/chat-bot-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StudyChatBotDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-study-case-event-container',
  templateUrl: './study-case-event-container.component.html',
  styleUrls: ['./study-case-event-container.component.scss']
})
export class StudyCaseEventContainerComponent implements OnInit, OnDestroy{
  public showChatBotButton: boolean;

  constructor(
    public dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService
  ){
    this.showChatBotButton = false;
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

    const studyId = this.studyCaseDataService.loadedStudy.studyCase.id;
    let chatbotData = new StudyChatBotDialogData();
    chatbotData.studyName = this.studyCaseDataService.loadedStudy.studyCase.name;
    chatbotData.chatBotUrl = environment['STUDY_LLM_URL']  + '/?embed=true&study-id=' + studyId ;
    this.dialog.open(ChatBotDialogComponent, {
      width: '400px', 
      position: { right: '0'},
      height: '600px',
      data: chatbotData,
      hasBackdrop: false
    });
  }

  ngOnDestroy(): void {
    if (this.dialog !== null && this.dialog !== undefined) {
      this.dialog.closeAll();
    }
  }

}

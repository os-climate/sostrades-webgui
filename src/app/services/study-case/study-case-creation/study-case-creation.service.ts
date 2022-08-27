import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProcessCreateStudyDialogData } from 'src/app/models/dialog-data.model';
import { Process } from 'src/app/models/process.model';
import { StudyCasePayload } from 'src/app/models/study.model';
import { ProcessStudyCaseCreationComponent } from 'src/app/modules/process/process-study-case-creation/process-study-case-creation.component';
import { AppDataService } from '../../app-data/app-data.service';
import { SocketService } from '../../socket/socket.service';
import { StudyCaseDataService } from '../data/study-case-data.service';
import { StudyCaseMainService } from '../main/study-case-main.service';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseCreationService {


  constructor(
    private dialog: MatDialog,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    private socketService: SocketService,
    private appDataService: AppDataService,
  ) {
  }

  opendialog() {

  }

  creatStudyCaseFromProcess(process: Process) {
    const dialogData: ProcessCreateStudyDialogData = new ProcessCreateStudyDialogData();
    dialogData.process = process;

    const dialogRef = this.dialog.open(ProcessStudyCaseCreationComponent, {
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const resultCreateStudyRef = result as ProcessCreateStudyDialogData;

      if ((resultCreateStudyRef !== null) && (resultCreateStudyRef !== undefined)) {

        if (resultCreateStudyRef.cancel === false && resultCreateStudyRef.studyName !== '' && resultCreateStudyRef.groupId !== null) {
          if (resultCreateStudyRef.studyType === 'Reference') {
            this.createFromReference(
              process,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId,
              resultCreateStudyRef.reference,
              resultCreateStudyRef.studyType);
          } else if (resultCreateStudyRef.studyType === 'Study') {
            this.createFromCopyStudy(
              resultCreateStudyRef.studyId,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId);
          } else if (resultCreateStudyRef.studyType === 'UsecaseData') {
            this.createFromUsesaseData(
              process,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId,
              resultCreateStudyRef.reference,
              resultCreateStudyRef.studyType);
          }
        }
      }
    });
  }

  creatStudyCaseFromStudyManagement() {
    const dialogData: ProcessCreateStudyDialogData = new ProcessCreateStudyDialogData();
    const dialogRef = this.dialog.open(ProcessStudyCaseCreationComponent, {
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const resultCreateStudyRef = result as ProcessCreateStudyDialogData;

      if ((resultCreateStudyRef !== null) && (resultCreateStudyRef !== undefined)) {

        if (resultCreateStudyRef.cancel === false && resultCreateStudyRef.studyName !== '' && resultCreateStudyRef.groupId !== null) {
          if (resultCreateStudyRef.studyType === 'Reference') {
            this.createFromReference(
              resultCreateStudyRef.process,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId,
              resultCreateStudyRef.reference,
              resultCreateStudyRef.studyType);
          } else if (resultCreateStudyRef.studyType === 'Study') {
            this.createFromCopyStudy(
              resultCreateStudyRef.studyId,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId);
          } else if (resultCreateStudyRef.studyType === 'UsecaseData') {
            this.createFromUsesaseData(
              resultCreateStudyRef.process,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId,
              resultCreateStudyRef.reference,
              resultCreateStudyRef.studyType);
          }
        }
      }
    });
  }

  createFromUsesaseData(process, name: string, group: number, reference: string, type: string) {
    const study = new StudyCasePayload(name, process.repositoryId, process.processId, group, reference, type);

    // Check user was in an another study before this one and leave room
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.socketService.leaveRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
    }

    this.appDataService.createCompleteStudy(study, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }

  createFromReference(process, name, group, reference, type) {
    const study = new StudyCasePayload(name, process.repositoryId, process.processId, group, reference, type);

    // Check user was in an another study before this one and leave room
    if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
      this.socketService.leaveRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
    }

    this.appDataService.createCompleteStudy(study, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }

  createFromCopyStudy(studyId: number, studyName: string, groupId: number) {

    this.appDataService.copyCompleteStudy(studyId, studyName, groupId, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }
}

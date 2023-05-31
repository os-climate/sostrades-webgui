import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { StudyCaseCreateDialogData } from 'src/app/models/dialog-data.model';
import { NodeData, ProcessBuilderAttribute, ProcessBuilderData } from 'src/app/models/node-data.model';
import { Process } from 'src/app/models/process.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { StudyCasePayload } from 'src/app/models/study.model';
import { StudyCaseCreationComponent } from 'src/app/modules/study-case/study-case-creation/study-case-creation.component';
import { AppDataService } from '../../app-data/app-data.service';
import { ProcessService } from '../../process/process.service';
import { SnackbarService } from '../../snackbar/snackbar.service';
import { SocketService } from '../../socket/socket.service';
import { StudyCaseDataService } from '../data/study-case-data.service';
import { StudyCaseMainService } from '../main/study-case-main.service';

@Injectable({
  providedIn: 'root'
})
export class StudyCaseCreationService {

  private dialogRef: MatDialogRef<StudyCaseCreationComponent>;
  constructor(
    private dialog: MatDialog,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    public processService: ProcessService,
    private socketService: SocketService,
    private appDataService: AppDataService,
    private snackbarService: SnackbarService
  ) { }


  showCreateStudyCaseDialog(process: Process) {
    const dialogData: StudyCaseCreateDialogData = new StudyCaseCreateDialogData();
    dialogData.process = process;

    this.dialogRef = this.dialog.open(StudyCaseCreationComponent, {
      disableClose: true,
      data: dialogData
    });

    this.dialogRef.afterClosed().subscribe(result => {
      const resultCreateStudyRef = result as StudyCaseCreateDialogData;

      if ((resultCreateStudyRef !== null) && (resultCreateStudyRef !== undefined)) {

        if (resultCreateStudyRef.cancel === false && resultCreateStudyRef.studyName !== '' && resultCreateStudyRef.groupId !== null) {
          if (resultCreateStudyRef.studyType === 'Study') {
            this.createStudyCaseByCopy(
              resultCreateStudyRef.studyId,
              resultCreateStudyRef.studyName,
              resultCreateStudyRef.groupId);
          } else {
            /**
             * Create an empty study case or using a data source with a reference or a usecase data
             * (setup by the dialog)
             */
            this.createStudyCase(
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

  private createStudyCase(process: Process, name: string, group: number, reference: string, type: string) {
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

  private createStudyCaseByCopy(studyId: number, studyName: string, groupId: number) {

    this.appDataService.copyCompleteStudy(studyId, studyName, groupId, isStudyCreated => {
      if (isStudyCreated) {
        // Joining room
        this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
      }
    });
  }

  /**
   * Display a modal component allowing to select a process and its associated source data
   * @param processBuilderData content of a process builder data
   * @returns Observable<@StudyCaseCreateDialogData>
   */
  selectProcess(processBuilderData: ProcessBuilderData): Observable<StudyCaseCreateDialogData> {

    const observableResult = new Observable<StudyCaseCreateDialogData>((observer) => {

      this.processService.getUserProcesses(false).subscribe( processes => {
        const foundProcess = processes.find(p =>  p.processId === processBuilderData.processIdentifier &&
                                                  p.repositoryId === processBuilderData.processRepositoryIdentifier);

        const dialogData: StudyCaseCreateDialogData = new StudyCaseCreateDialogData();
        dialogData.selectProcessOnly = true;
        dialogData.process = foundProcess;
        dialogData.reference = processBuilderData.usecaseInfoName;
        dialogData.studyType = processBuilderData.usecaseInfoType;
        dialogData.studyId = processBuilderData.usecaseInfoIdentifier;

        this.dialogRef = this.dialog.open(StudyCaseCreationComponent, {
          disableClose: true,
          data: dialogData
        });

        this.dialogRef.afterClosed().subscribe(result => {
          const studyCaseData = result as StudyCaseCreateDialogData;
          observer.next(studyCaseData);
        });
      }, errorReceived => {
        const error = errorReceived as SoSTradesError;

        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          const errorMessage = `Error loading process list for form : ${error.description}`;
          this.snackbarService.showError(errorMessage);
          observer.error(errorMessage);
        }
      });
    });
    return observableResult;
  }

  closeStudyCaseCreationDialog() {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}

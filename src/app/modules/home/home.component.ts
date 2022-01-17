import { Component, OnInit, OnDestroy } from '@angular/core';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { ValidationDialogData, StudyCaseModificationDialogData } from 'src/app/models/dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyUpdateParameter } from 'src/app/models/study-update.model';
import { StudyCaseModificationDialogComponent } from '../study-case/study-case-modification-dialog/study-case-modification-dialog.component';
import { Subscription } from 'rxjs';
import { CalculationService } from 'src/app/services/calculation/calculation.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  public hasAccessToStudy: boolean;
  authenticated: boolean;
  username: string;
  calculationChangeSubscription: Subscription;

  sizes = {
    bottom: {
      area1: 85,
      area2: 15,
    },
    left: {
      area1: 250,
      area2: '*',
    }
  };

  constructor(
    private appDataService: AppDataService,
    public studyCaseDataService: StudyCaseDataService,
    private calculationService: CalculationService,
    private socketService: SocketService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService) {
    this.hasAccessToStudy = false;
  }

  ngOnInit(): void {

    if (this.userService.hasAccessToStudy()) {
      this.hasAccessToStudy = true;

      if (this.studyCaseLocalStorageService.studiesHaveUnsavedChanges()) {
        const validationDialogData = new ValidationDialogData();
        validationDialogData.message = `You have made unsaved changes in a study, handle changes ?`;
        validationDialogData.buttonOkText = 'Load Study';
        validationDialogData.buttonSecondaryActionText = 'Save & Synchronise';

        const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
          disableClose: true,
          width: '500px',
          height: '220px',
          data: validationDialogData
        });

        dialogRefValidate.afterClosed().subscribe(result => {
          const validationData: ValidationDialogData = result as ValidationDialogData;

          if ((validationData !== null) && (validationData !== undefined)) {
            if (validationData.cancel !== true) {

              this.studyCaseDataService.getStudies().subscribe(studies => {
                const study = studies.filter(x => x.id === this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges());

                if (study[0] !== null && study[0] !== undefined) {
                  if (validationData.validate === true) { // Loading study with unsaved changes
                    this.appDataService.loadCompleteStudy(study[0].id, study[0].name, isStudyLoaded => {
                      if (isStudyLoaded) {
                        this.socketService.joinRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
                      }
                    });
                  } else { // Saving & synchronise
                    let studyParameters: StudyUpdateParameter[] = [];
                    studyParameters = this.studyCaseLocalStorageService
                      .getStudyParametersFromLocalStorage(this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges().toString());

                    const studyCaseModificatioDialogData = new StudyCaseModificationDialogData();
                    studyCaseModificatioDialogData.changes = studyParameters;

                    const dialogRefSave = this.dialog.open(StudyCaseModificationDialogComponent, {
                      disableClose: true,
                      width: '1100px',
                      height: '800px',
                      panelClass: 'csvDialog',
                      data: studyCaseModificatioDialogData
                    });

                    dialogRefSave.afterClosed().subscribe(resultSave => {
                      const resultData: StudyCaseModificationDialogData = resultSave as StudyCaseModificationDialogData;

                      if ((resultData !== null) && (resultData !== undefined)) {
                        if (resultData.cancel !== true) {

                          this.studyCaseLocalStorageService.saveStudyChanges(
                            this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges().toString(),
                            resultData.changes,
                            false,
                            isSaveDone => {
                              if (isSaveDone) {
                                // Send socket notifications
                                this.socketService.saveStudy(this.studyCaseDataService.loadedStudy.studyCase.id, resultData.changes);
                              }
                            });
                        }
                      }
                    });
                  }
                } else {
                  // Study case doesnt exist anymore in database deleting local changes
                  this.studyCaseLocalStorageService.removeStudyParametersFromLocalStorage(
                    this.studyCaseLocalStorageService.getStudyIdWithUnsavedChanges().toString());
                  this.snackbarService.showWarning('The study doesn\'t exist anymore in database, your local changes have been deleted.');
                }
              }, errorReceived => {
                if (errorReceived.redirect !== true) { // Error with redirection
                  this.snackbarService.showError(errorReceived.description);
                }
              });
            }
          }
        });
      }
    } else {
      this.hasAccessToStudy = false;
    }
  }

  ngOnDestroy() {
    if ((this.calculationChangeSubscription !== null) && (this.calculationChangeSubscription !== undefined)) {
      this.calculationChangeSubscription.unsubscribe();
    }
  }

  displayLogs() {
    if (this.router.url === '/study-workspace') {
      return true;
    }
    return false;
  }

  displayLogViewFullSize() {
    return this.calculationService.logFullSizeViewActive;
  }

  dragEnd(position, { sizes }) {
    if (position === 'bottom') {
      this.sizes.bottom.area1 = sizes[0];
      this.sizes.bottom.area2 = sizes[1];
    } else if (position === 'left') {
      this.sizes.left.area1 = sizes[0];
      this.sizes.bottom.area2 = sizes[0];
    }
  }
}

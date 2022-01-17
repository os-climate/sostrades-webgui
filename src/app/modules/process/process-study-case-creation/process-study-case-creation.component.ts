import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProcessCreateStudyDialogData } from 'src/app/models/dialog-data.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { Study } from 'src/app/models/study.model';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { ReferenceDataService } from 'src/app/services/reference/data/reference-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';


@Component({
  selector: 'app-process-create-study',
  templateUrl: './process-study-case-creation.component.html',
  styleUrls: ['./process-study-case-creation.component.scss']
})

export class ProcessStudyCaseCreationComponent implements OnInit {
  public createStudyForm: FormGroup;
  public groupList: LoadedGroup[];
  public referenceList: Study[];
  public isLoading: boolean;

  readonly EMPTY_STUDY_NAME = 'Empty Study';

  constructor(
    private groupDataService: GroupDataService,
    private studyCaseDataService: StudyCaseDataService,
    private referenceDataService: ReferenceDataService,
    private snackbarService: SnackbarService,
    public dialogRef: MatDialogRef<ProcessStudyCaseCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProcessCreateStudyDialogData) {
    this.groupList = [];
    this.referenceList = [];
    this.isLoading = true;
  }

  ngOnInit(): void {

    const emptyProcessRef = new Study(null, this.EMPTY_STUDY_NAME, '', '', '', null, null, '',
      'Reference', '', 0, false, '', '', false, null, null, false, false, false, false);
    this.referenceList.push(emptyProcessRef);
    this.data.referenceList.forEach(ref => {
      this.referenceList.push(ref);
    });

    this.createStudyForm = new FormGroup({
      studyName: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupId: new FormControl('', [Validators.required]),
      selectedRef: new FormControl(emptyProcessRef)
    });

    this.studyCaseDataService.getAuthorizedStudiesForProcess(this.data.processId, this.data.repositoryId).subscribe(studies => {
      studies.forEach(study => {
        this.referenceList.push(study);
      });

      this.referenceDataService.getReferencesGenStatusByName(this.data.referenceList).subscribe(refStatuses => {
        refStatuses.forEach(refStatus => {
          if (refStatus.referenceGenerationStatus === 'RUNNING'
            || refStatus.referenceGenerationStatus === 'PENDING') { // Reference generation in progress
            const refRunning = this.referenceList.filter(x => `${x.repository}.${x.process}.${x.name}` === refStatus.referenceName);
            if (refRunning !== null && refRunning !== undefined && refRunning.length > 0) {
              refRunning[0].isRegeneratingReference = true;
            }
          }
        });
        this.groupDataService.getUserGroups().subscribe(response => {
          const grpList: LoadedGroup[] = response;
          grpList.forEach(group => {
            this.groupList.push(group);
          });
          this.isLoading = false;
        }, errorReceived => {
          const error = errorReceived as SoSTradesError;
          this.onCancelClick();
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError('Error loading group list for form : ' + error.description);
          }
        });

      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading references status list for form : ' + error.description);
        }
      });
    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      this.onCancelClick();
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error loading studies list for form : ' + error.description);
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.createStudyForm.controls[controlName].hasError(errorName);
  }

  submitForm() {
    this.data.cancel = false;

    let refName = null;
    if (this.createStudyForm.value.selectedRef.name !== this.EMPTY_STUDY_NAME) {
      refName = this.createStudyForm.value.selectedRef.name;
    }
    this.data.studyType = this.createStudyForm.value.selectedRef.studyType;
    this.data.studyId = this.createStudyForm.value.selectedRef.id;

    this.data.studyName = this.createStudyForm.value.studyName;
    this.data.reference = refName;
    this.data.groupId = this.createStudyForm.value.groupId;

    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }


}

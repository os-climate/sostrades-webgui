import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProcessCreateStudyDialogData } from 'src/app/models/dialog-data.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { Process } from 'src/app/models/process.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { Study } from 'src/app/models/study.model';
import { UserApplicationRight } from 'src/app/models/user.model';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { ReferenceDataService } from 'src/app/services/reference/data/reference-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { UserService } from 'src/app/services/user/user.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';


@Component({
  selector: 'app-process-create-study',
  templateUrl: './process-study-case-creation.component.html',
  styleUrls: ['./process-study-case-creation.component.scss']
})

export class ProcessStudyCaseCreationComponent implements OnInit, OnDestroy {
  public createStudyForm: FormGroup;
  public groupList: LoadedGroup[];
  public referenceList: Study[];
  public isLoading: boolean;
  public user: UserApplicationRight;
  public loadedGroup: LoadedGroup;
  public process: Process;
  public processList: Process[];
  public filteredProcesses: ReplaySubject<Process[]> = new ReplaySubject<Process[]>(1);
  public disabledReference: boolean;
  protected onDestroy = new Subject<void>();
  public processFiltered: FormControl;


  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  readonly EMPTY_STUDY_NAME = 'Empty Study';

  constructor(
    private groupDataService: GroupDataService,
    private studyCaseDataService: StudyCaseDataService,
    private referenceDataService: ReferenceDataService,
    private snackbarService: SnackbarService,
    private processService: ProcessService,
    private userService: UserService,
    public dialogRef: MatDialogRef<ProcessStudyCaseCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProcessCreateStudyDialogData) {
    this.groupList = [];
    this.referenceList = [];
    this.disabledReference = false;
    this.isLoading = true;
    this.processFiltered = new FormControl('', [Validators.required]);
  }

  ngOnInit(): void {

    const emptyProcessRef = new Study(null, this.EMPTY_STUDY_NAME, '', '', '', null, null, '',
      'Reference', '', 0, false, '', '', false, null, null, false, false, false, false, false);
    this.referenceList.push(emptyProcessRef);

    this.createStudyForm = new FormGroup({
      studyName: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
      groupId: new FormControl('', [Validators.required]),
      processId: new FormControl('', [Validators.required]),
      selectedRef: new FormControl(emptyProcessRef)
    });
    // Check if process is not empty (create study from a process)
    if (this.data.process !== null && this.data.process !== undefined ) {
      this.data.process.referenceList.forEach(ref => {
        this.referenceList.push(ref);
      });
      this.studyCaseDataService.getAuthorizedStudiesForProcess(
        this.data.process.processId, this.data.process.repositoryId).subscribe(studies => {
        studies.forEach(study => {
          this.referenceList.push(study);
        });
        this.disabledReference = false;
        this.referenceDataService.getReferencesGenStatusByName(this.data.process.referenceList).subscribe(refStatuses => {
          refStatuses.forEach(refStatus => {
            if (refStatus.referenceGenerationStatus === 'RUNNING'
              || refStatus.referenceGenerationStatus === 'PENDING') { // Reference generation in progress
              const refRunning = this.referenceList.filter(x => `${x.repository}.${x.process}.${x.name}` === refStatus.referenceName);
              if (refRunning !== null && refRunning !== undefined && refRunning.length > 0) {
                refRunning[0].isRegeneratingReference = true;
              }
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
            this.isLoading = false;
          });

      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading studies list for form : ' + error.description);
        }
        this.isLoading = false;
      });
    }

    this.userService.getCurrentUser().subscribe(currentUser => {
      this.user = currentUser;

       // Get list of process
      this.processService.getUserProcesses().subscribe( processes => {
        this.processList = processes;

         // load the initial process list
        this.filteredProcesses.next(this.processList.slice());

        // Set default process
        if (this.data.process !== null && this.data.process !== undefined ) {
          this.createStudyForm.patchValue({processId: this.data.process.id});
         }

        // listen for search field value changes
        this.processFiltered.valueChanges.pipe(takeUntil(this.onDestroy))
          .subscribe(() => {
            this._filter();
          });

        // Get user's group list
        this.groupDataService.getUserGroups().subscribe(response => {
          const grpList: LoadedGroup[] = response;
          grpList.forEach(group => {
            this.groupList.push(group);

            // Set the default group in the dropdown
            const defaultGroupId = this.user.user.default_group_id;
            if (defaultGroupId !== null || defaultGroupId !== undefined) {
              if (group.group.id === defaultGroupId) {
                this.loadedGroup = group;
                this.createStudyForm.patchValue({
                  groupId: this.loadedGroup.group.id,
                });
              }
            }
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
          this.isLoading = false;
        });

      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading process list for form : ' + error.description);
        }
        this.isLoading = false;
      });

    }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading user for form : ' + error.description);
        }
        this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }


  public onProcessChange(event: any) {
    this.disabledReference = true;
    // Retrieve the process
    this.process = this.processList.find(process => process.id === event);

    // Remove all element of the list except "Empty study" before push new elements.
    this.referenceList.splice(1);

    if (this.process.referenceList.length > 0) {
      // Get usecase and push on the refence list
      this.process.referenceList.forEach(usecase => {
          this.referenceList.push(usecase);
      });
    }
    // Get study referenced push on the refence list
    this.studyCaseDataService.getAuthorizedStudiesForProcess(this.process.processId, this.process.repositoryId).subscribe(studies => {
      studies.forEach(study => {
        this.referenceList.push(study);
      });
      this.disabledReference = false;
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
    this.data.process = this.process;

    this.dialogRef.close(this.data);
  }

  onCancelClick() {
    this.data.cancel = true;
    this.dialogRef.close(this.data);
  }

  protected _filter() {
    if (!this.processList) {
      return;
    }
    // get the search keyword
    let search = this.processFiltered.value;
    if (!search) {
      this.filteredProcesses.next(this.processList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the process
    this.filteredProcesses.next(
      this.processList.filter(process =>
        process.processId.toLowerCase().indexOf(search) > -1 || process.repositoryName.toLowerCase().indexOf(search) > -1)
    );
  }
}

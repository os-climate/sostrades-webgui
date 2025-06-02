import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StudyCaseCreateDialogData } from 'src/app/models/dialog-data.model';
import { LoadedGroup } from 'src/app/models/group.model';
import { Process } from 'src/app/models/process.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { CreationStatus, Study } from 'src/app/models/study.model';
import { UserApplicationRight } from 'src/app/models/user.model';
import { FlavorsService } from 'src/app/services/flavors/flavors.service';
import { GroupDataService } from 'src/app/services/group/group-data.service';
import { ProcessService } from 'src/app/services/process/process.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { UserService } from 'src/app/services/user/user.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

@Component({
  selector: 'app-study-case-creation',
  templateUrl: './study-case-creation.component.html',
  styleUrls: ['./study-case-creation.component.scss']
})
export class StudyCaseCreationComponent implements OnInit, OnDestroy {
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
  public disabledReferenceList: boolean;
  protected onDestroy = new Subject<void>();
  public processFiltered: FormControl;
  private processReferenceList: Study[];
  private processUserStudyCaseList: Study[];
  private processReady: boolean;
  private processReferenceReady: boolean;
  private studyCaseReferenceReady: boolean;
  private groupReady: boolean;
  private emptyProcessRef: Study;
  private selectedFile: File;
  private checkIfReferenceIsAlreadySelected: boolean;
  public title: string;
  public flavorsList: string[];
  public hasFlavors: boolean;
  public loadingName: boolean;
  public isStandAlone: boolean;


  readonly EMPTY_STUDY_NAME = 'Empty Study';
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  constructor(
    private groupDataService: GroupDataService,
    private studyCaseDataService: StudyCaseDataService,
    private snackbarService: SnackbarService,
    private processService: ProcessService,
    private userService: UserService,
    private flavorsService: FlavorsService,
    public dialogRef: MatDialogRef<StudyCaseCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StudyCaseCreateDialogData) {
    this.groupList = [];
    this.process = null;
    this.referenceList = [];
    this.disabledReference = true;
    this.isLoading = true;
    this.processFiltered = new FormControl('', [Validators.required]);
    this.processReferenceList = [];
    this.processUserStudyCaseList = [];
    this.processReady = false;
    this.processReferenceReady = false;
    this.studyCaseReferenceReady = false;
    this.groupReady = false;
    this.disabledReferenceList = false;
    this.checkIfReferenceIsAlreadySelected = false;
    this.title = 'Create new study';
    this.flavorsList = [];
    this.hasFlavors = false;
    this.loadingName = false;
    this.isStandAlone = false;
    this.selectedFile = null;


    /**
     * Create a placeholder reference to allow to choose nothing to initialize the study case
     */
    this.emptyProcessRef = new Study(null, this.EMPTY_STUDY_NAME, '', '', '', null, null, '',  '',
     '', '', 0, false, '', '', false, null, null, false, false, false, false, false, false, null, '', null, null, null, '', '', false, false);

  }

  ngOnInit(): void {

    /**
     * Create FormGroup instance to manage the user inputs
     * This component is used in two modes:
     * - To create a study case : in this case user set 4 FromControls
     * - To setup a process with (or without) a data source (this is a way to fill a specific parameter type
     * tant can be found in a study case)
     */
    if (this.data.selectProcessOnly === true) {
      this.createStudyForm = new FormGroup({
        processId: new FormControl('', [Validators.required]),
        selectedRef: new FormControl(this.emptyProcessRef),
        flavor:new FormControl('')
      });

      /**
       * No need to wait to group setup
       */
      this.groupReady = true;

    } else {
      this.createStudyForm = new FormGroup({
        studyName: new FormControl('', [Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]),
        groupId: new FormControl('', [Validators.required]),
        processId: new FormControl('', [Validators.required]),
        selectedRef: new FormControl(this.emptyProcessRef),
        flavor:new FormControl(''),
        fileUpload: new FormControl('')
      });
    }

    /**
     * Process, Study case to display are depending of the user
     */
    this.userService.getCurrentUser().subscribe({
      next: (currentUser) => {
      this.user = currentUser;

      this.checkIfReferenceIsAlreadySelected = true;

      /**
       * if 'process' attribute instance is set, then it has to be pre selected
       * and its references has to be pushed into the reference list
       */
      if (this.data.process !== null && this.data.process !== undefined ) {
        this.process = this.data.process;
      }

      /**
       * Once the user restrieve without error we can check the next steps:
       * - get the process and reference list
       * - get the study case list
       * - get the group list
       */

      /**
       * process section
       */
      this.setupProcesses();

      /**
       * reference and study case section
       * Here get the reference regarding input process information (if defined)
       */
      this.getStudyCaseReferences();

      /**
       * group section
       */
      if (this.data.selectProcessOnly === false) {
        this.setupGroup();
      }

    }, error: (errorReceived) => {
      const error = errorReceived as SoSTradesError;
      this.onCancelClick();
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.snackbarService.showError('Error loading user for form : ' + error.description);
      }
      this.isLoading = false;
      }
    });

    //get flavors in config api
    this.flavorsService.getAllFlavorsStudy().subscribe(flavorsList =>
      {
        this.flavorsList = flavorsList;
         //select flavor if it is already set for the study
        if (this.data.selectedFlavor !== null && this.data.selectedFlavor !== undefined ) {
          this.createStudyForm.patchValue({
            flavor: this.data.selectedFlavor,
          });
          this.createStudyForm.value.flavor = this.data.selectedFlavor;
        }
        else if (flavorsList !== null && flavorsList !== undefined && flavorsList.length > 0){
          this.hasFlavors = true;
          this.createStudyForm.patchValue({
            flavor: flavorsList[0],
          });
          this.createStudyForm.value.flavor = flavorsList[0];
        }
      
      }
    );

  }

  private setupProcesses() {

    this.processService.getUserProcesses(false).subscribe({
      next: (processes) => {
        // Filter processes to only use those where the user can access
        this.processList = processes.filter(p => p.isManager || p.isContributor);
      
        // Load the initial process list
        this.filteredProcesses.next(this.processList.slice());
      
        /**
         * If a process is already selected then update its associated reference list
         */
        if ((this.process !== null) && (this.process !== undefined)) {
          this.createStudyForm.patchValue({ processId: this.process.id });
          this.getProcessReferences();
        } else {
          this.processReferenceReady = true;
        }
      
        // Listen for search field value changes
        this.processFiltered.valueChanges.pipe(takeUntil(this.onDestroy))
          .subscribe(() => {
            this._filter();
          });
      
        this.processReady = true;
        this.terminateSetup();
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading process list for form : ' + error.description);
        }
        this.isLoading = false;
      }
    });
  }

  private getProcessReferences() {
    /**
     * If a process is already selected then update its associated reference list
     */
    if ((this.process !== null ) && (this.process !== undefined)) {
      this.processReferenceList = [];
      this.process.referenceList.forEach(ref => {
        this.processReferenceList.push(ref);
      });
    }
    this.processReferenceReady = true;
    this.terminateSetup();
  }

  /**
   * Create 12/09/2022
   *  Get study referenced by process ordered by most recent creation date.
   *
   */

   private getStudyCaseReferences() {

    const studyList: Study[] = [];

    if ((this.process !== null) && (this.process !== undefined)) {
      this.studyCaseDataService.getAuthorizedStudiesForProcess(this.process.processId, this.process.repositoryId).subscribe({
        next: (studies) => {
          studies.forEach(study => {
            if (study.creationStatus === CreationStatus.CREATION_DONE || study.creationStatus === 'DONE'){
              studyList.push(study);
            }
          });
          // Sort list of study by creation date
          studyList.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
      
          // Concat refenceList with studyList to display in first empty study and usecase and then the studyList sorted by creation date.
          this.processUserStudyCaseList = studyList;
      
          this.studyCaseReferenceReady = true;
          this.terminateSetup();
        },
        error: (errorReceived) => {
          const error = errorReceived as SoSTradesError;
          this.onCancelClick();
          if (error.redirect) {
            this.snackbarService.showError(error.description);
          } else {
            this.snackbarService.showError('Error loading studies list for form : ' + error.description);
          }
          this.isLoading = false;
        }
      });
    } else {
      this.studyCaseReferenceReady = true;
      this.terminateSetup();
    }
  }

  private setupGroup() {
    this.groupDataService.getUserGroups(true).subscribe({
      next: (response) => {
        
        response.forEach(group => {
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
        this.groupReady = true;
        this.terminateSetup();
      },
      error: (errorReceived) => {
        const error = errorReceived as SoSTradesError;
        this.onCancelClick();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error loading group list for form : ' + error.description);
        }
        this.isLoading = false;
      }
    });
  }

  private terminateSetup() {
    if ((this.processReady) && (this.processReferenceReady) && (this.studyCaseReferenceReady) && (this.groupReady)) {
      /**
       * merge process reference list and user study list
       */
      let mergedList = [];
      mergedList.push(this.emptyProcessRef);
      mergedList = mergedList.concat(this.processReferenceList);
      this.referenceList = mergedList.concat(this.processUserStudyCaseList);

      let selectedReferecence: Study = null;
      if (this.checkIfReferenceIsAlreadySelected === true) {
        this.checkIfReferenceIsAlreadySelected = false;

        // check if a pre selected usecase is existing
        if (this.data.reference) {
          if(this.data.studyId) {
              selectedReferecence = this.referenceList.find(dataSource => dataSource.id === this.data.studyId);
          }
          else {
            selectedReferecence = this.referenceList.find(dataSource => dataSource.name === this.data.reference);
            this.createStudyForm.get('selectedRef').disable();
            this.createStudyForm.get('processId').disable();
          }
        }
      }

      // if 'studyId' attribute instance is set, then it has to be pre selected on reference
      if ((this.data.studyId !== null && this.data.studyId !== undefined) && this.data.studyId > 0 && !this.data.selectProcessOnly) {
        const selectedStudy = this.referenceList.find(study =>study.id === this.data.studyId);
        if (selectedStudy) {
          this.createStudyForm.patchValue({selectedRef: selectedStudy});
          this.createStudyForm.get('selectedRef').disable();
          this.createStudyForm.get('processId').disable();
          this.title = `Copy study "${selectedStudy.name}"`;
          this.disabledReferenceList = true;
        } else {
          this.isLoading = false;
          this.snackbarService.showError(`Error loading reference list from ${this.process.processName}` );
          this.dialogRef.close(this.data);
        }
      } else {
        if ((selectedReferecence === null) || (selectedReferecence === undefined)) {
          selectedReferecence = this.emptyProcessRef;
        }
        this.createStudyForm.patchValue({selectedRef: selectedReferecence});
        this.disabledReference = false;
        if (this.data.selectProcessOnly) {
          this.title = 'Select process & source data';
        }
      }
      this.isLoading = false;
      this.focusOnHtlmElement();
    }
  }

  private focusOnHtlmElement() {
    // Apply a focus on element html
    if (!this.isLoading) {
      if (this.data.selectProcessOnly === false) {
        setTimeout( () => document.getElementById('studyName').focus());
      } else {
        setTimeout( () => document.getElementById('process').focus());
      }
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }


  public onProcessChange(event: any) {
    this.disabledReference = true;
    this.processReferenceReady = false;
    this.studyCaseReferenceReady = false;

    // Retrieve the process
    this.process = this.processList.find(process => process.id === event);

    this.getProcessReferences();

    this.getStudyCaseReferences();
  }

  public onGroupChanged(){
    this.createStudyForm.updateValueAndValidity();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.createStudyForm.controls[controlName].hasError(errorName);
  }

  onSelectStandAlone(isSelected:boolean) {
    this.isStandAlone = isSelected;
    if (isSelected) {
      this.createStudyForm.controls['fileUpload'].setValidators([Validators.required]);
      this.createStudyForm.controls['fileUpload'].updateValueAndValidity();
      this.createStudyForm.controls['studyName'].clearValidators();
      this.createStudyForm.controls['studyName'].updateValueAndValidity();
      this.createStudyForm.controls['processId'].clearValidators();
      this.createStudyForm.controls['processId'].updateValueAndValidity();
      
    }
    else{
      this.createStudyForm.controls['fileUpload'].clearValidators();
      this.createStudyForm.controls['fileUpload'].updateValueAndValidity();
      this.createStudyForm.controls['studyName'].setValidators([Validators.required, Validators.pattern(TypeCheckingTools.TEXT_LETTER_NUMBER_REGEX)]);
      this.createStudyForm.controls['studyName'].updateValueAndValidity();
      this.createStudyForm.controls['processId'].setValidators([Validators.required]);
      this.createStudyForm.controls['processId'].updateValueAndValidity();
    }
    this.createStudyForm.updateValueAndValidity();
    }

  importStudyStandAlone(){
    const fileUploadElement = this.fileUpload.nativeElement;
    fileUploadElement.click();
  }
  
  onSelectStudyFileZip(event: any) {

    if (event.target.files !== undefined && event.target.files !== null && event.target.files.length > 0) {
      //if not on local and if the file size is upper than 10Mo set control form in error
      const host = window.location.host;
      if (!host.includes('localhost:') && event.target.files[0].size > 10 * 1024 * 1024) {
        this.createStudyForm.get('fileUpload').setErrors({
          fileSize: 'The file size must be less than 10Mo'
        });
        return;
      }
      this.selectedFile = event.target.files[0];
      this.createStudyForm.patchValue({fileUpload:this.selectedFile.name});
      this.createStudyForm.updateValueAndValidity();
    }
  }

  submitForm() {
    this.data.cancel = false;

    if (this.isStandAlone){
      this.data.groupId = this.createStudyForm.value.groupId;
      this.data.zipFile = this.selectedFile;
      this.data.studyType = "stand-alone";
      this.dialogRef.close(this.data);
    }
    else{
      let refName = null;
      let selectedRef = this.createStudyForm.value.selectedRef

      if (selectedRef === null || selectedRef === undefined) {
        if(this.data.studyId) {
          selectedRef = this.referenceList.find(dataSource => dataSource.id === this.data.studyId);
        }
        else {
          selectedRef = this.referenceList.find(dataSource => dataSource.name === this.data.reference);
        }
      }

      if(selectedRef.name !== this.EMPTY_STUDY_NAME) {
        refName = selectedRef.name;
      }
      this.loadingName = true;
      this.studyCaseDataService.check_study_already_exist(this.createStudyForm.value.studyName, this.createStudyForm.value.groupId).subscribe({
        next: (isExist) => {
          if(!isExist) {
            this.data.studyType = selectedRef.studyType;
            this.data.studyId = selectedRef.id;
            this.data.studyName = this.createStudyForm.value.studyName;
            this.data.reference = refName;
            this.data.groupId = this.createStudyForm.value.groupId;
            this.data.selectedFlavor = this.createStudyForm.value.flavor;

            this.data.process = this.process;

            this.dialogRef.close(this.data);
          } else {
            this.createStudyForm.get('studyName').setErrors({
              studyExists: `The following study case name "${this.createStudyForm.value.studyName}" already exist in the database for the selected group`
            }); 
          }
          this.loadingName = false; 
          },
          error: (errorReceived) => {
            this.snackbarService.showError("Error creating study\n" + errorReceived.description);
            this.loadingName = false; 
          }
        });
      }
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
        process.processId.toLowerCase().indexOf(search) > -1 || process.repositoryName.toLowerCase().indexOf(search) > -1
        ||  process.processName.toLowerCase().indexOf(search) > -1 || process.repositoryId.toLowerCase().indexOf(search) > -1)
    );
  }
}

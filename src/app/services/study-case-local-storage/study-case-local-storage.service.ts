import { Injectable, EventEmitter } from '@angular/core';
import { StudyUpdateParameter, StudyUpdateContainer } from 'src/app/models/study-update.model';
import { StudyCaseDataService } from '../study-case/data/study-case-data.service';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { SnackbarService } from '../snackbar/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogService } from '../loading-dialog/loading-dialog.service';
import { PostOntology } from 'src/app/models/ontology.model';
import { LoadedStudy } from 'src/app/models/study.model';
import { OntologyService } from '../ontology/ontology.service';
import { TreenodeTools } from 'src/app/tools/treenode.tool';
import { SocketService } from '../socket/socket.service';
import { DataStorage } from 'src/app/models/data-storage.model';
import { StudyCaseMainService } from '../study-case/main/study-case-main.service';
import { NodeData } from 'src/app/models/node-data.model';

/* eslint-disable max-len */

@Injectable({
  providedIn: 'root'
})
export class StudyCaseLocalStorageService {

  public unsavedChanges: EventEmitter<boolean> = new EventEmitter();
  public onNodeDataChange: EventEmitter<string> = new EventEmitter();

  private dataStorage: DataStorage;

  constructor(
    private dialog: MatDialog,
    private socketService: SocketService,
    private ontologyService: OntologyService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    public snackbarService: SnackbarService,
    private loadingDialogService: LoadingDialogService) {
      this.dataStorage = new DataStorage();
    }

  getOneStudyParameterFromLocalStorage(studyId: string, itemName: string): StudyUpdateParameter {
    let studyParameter: StudyUpdateParameter = null;
    const studiesContainer = JSON.parse(this.dataStorage.getItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST)) as StudyUpdateContainer;

    if (studiesContainer !== null && studiesContainer !== undefined) {
      if (studiesContainer.studies[studyId] !== null && studiesContainer.studies[studyId] !== undefined) {
        // Parameter found in local storage
        if (studiesContainer.studies[studyId][itemName] !== null && studiesContainer.studies[studyId][itemName] !== undefined) {
          studyParameter = studiesContainer.studies[studyId][itemName];
        }
      }
    }
    return studyParameter;
  }

  getStudyParametersFromLocalStorage(studyId: string): StudyUpdateParameter[] {
    const studyParameters: StudyUpdateParameter[] = [];
    const studiesContainer = JSON.parse(this.dataStorage.getItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST)) as StudyUpdateContainer;

    if (studiesContainer !== null && studiesContainer !== undefined) {
      if (studiesContainer.studies[studyId] !== null && studiesContainer.studies[studyId] !== undefined) {
        Object.keys(studiesContainer.studies[studyId]).forEach(paramKey => {
          studyParameters.push(studiesContainer.studies[studyId][paramKey]);
        });
      }
    }
    return studyParameters;
  }

  getStudiesParametersFromLocalStorage(): StudyUpdateContainer {
    return JSON.parse(this.dataStorage.getItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST)) as StudyUpdateContainer;
  }

  setStudyParametersInLocalStorage(item: StudyUpdateParameter, nodeData: NodeData, studyId: string) {
    let studiesContainer: StudyUpdateContainer;
    const itemName = nodeData.identifier;

    if (item.variableId[0] === '.') {
      item.variableId = item.variableId.substring(1);
    }

    studiesContainer = this.getStudiesParametersFromLocalStorage();

    // Studies container exist in local storage
    if (studiesContainer !== null && studiesContainer !== undefined) {
      // Create study if it doesn't exist in container
      if (studiesContainer.studies[studyId] === null || studiesContainer.studies[studyId] === undefined) {
        studiesContainer.studies[studyId] = {};
      }

      if (item.newValue === item.oldValue) {
        delete studiesContainer.studies[studyId][itemName];
      } else if (JSON.stringify(item.newValue) === JSON.stringify(item.oldValue)) {
        delete studiesContainer.studies[studyId][itemName];
      } else {
        studiesContainer.studies[studyId][itemName] = item;
      }

      this.dataStorage.setItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST, JSON.stringify(studiesContainer));

    } else { // Study container doesn't exist in local storage
      studiesContainer = new StudyUpdateContainer();
      studiesContainer.studies = {};
      studiesContainer.studies[studyId] = {};

      if (item.newValue !== item.oldValue) {
        studiesContainer.studies[studyId][itemName] = item;
        this.dataStorage.setItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST, JSON.stringify(studiesContainer));
      } else if (JSON.stringify(item.newValue) !== JSON.stringify(item.oldValue)) {
        studiesContainer.studies[studyId][itemName] = item;
        this.dataStorage.setItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST, JSON.stringify(studiesContainer));
      }
    }

    // Check if study have unsaved changes
    this.unsavedChanges.emit(this.studyHaveUnsavedChanges(studyId));
  }

  removeStudyParametersFromLocalStorage(studyId: string) {
    let studiesContainer: StudyUpdateContainer;
    studiesContainer = this.getStudiesParametersFromLocalStorage();
    // Studies container exist in local storage
    if (studiesContainer !== null && studiesContainer !== undefined) {
      delete studiesContainer.studies[studyId];
      this.dataStorage.setItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST, JSON.stringify(studiesContainer));
    }
    this.unsavedChanges.emit(false);
  }

  removeStudiesFromLocalStorage() {
    this.dataStorage.setItem(StudyCaseLocalStorageAttributes.STUDYPARAMETERLIST, null);
    this.unsavedChanges.emit(false);
  }

  studyHaveUnsavedChanges(studyId: string): boolean {
    let haveUnsavedChanges = false;

    let studiesContainer: StudyUpdateContainer;
    studiesContainer = this.getStudiesParametersFromLocalStorage();

    if (studiesContainer !== null && studiesContainer !== undefined) {
      if (studiesContainer.studies[studyId] !== null && studiesContainer.studies[studyId] !== undefined) {
        if (Object.keys(studiesContainer.studies[studyId]).length > 0) {
          haveUnsavedChanges = true;
          this.unsavedChanges.emit(true);
        }
      }
    }
    return haveUnsavedChanges;
  }

  studiesHaveUnsavedChanges(): boolean {
    let haveUnsavedChanges = false;

    let studiesContainer: StudyUpdateContainer;
    studiesContainer = this.getStudiesParametersFromLocalStorage();

    if (studiesContainer !== null && studiesContainer !== undefined) {
      if (Object.keys(studiesContainer.studies).length > 0) {
        // Check every existing studies
        Object.keys(studiesContainer.studies).forEach(key => {
          if (Object.keys(studiesContainer.studies[key]).length > 0) {
            haveUnsavedChanges = true;
            this.unsavedChanges.emit(true);
          }
        });
      }
    }

    return haveUnsavedChanges;
  }

  getStudyIdWithUnsavedChanges(): number {
    let studyId: number = null;
    if (this.studiesHaveUnsavedChanges) {
      let studiesContainer: StudyUpdateContainer;
      studiesContainer = this.getStudiesParametersFromLocalStorage();
      Object.keys(studiesContainer.studies).forEach(key => {
        if (Object.keys(studiesContainer.studies[key]).length > 0) {
          // eslint-disable-next-line radix
          studyId = parseInt(key);
          this.unsavedChanges.emit(true);
        }
      });
    }
    return studyId;
  }

  saveStudyChanges(studyId: string, studyParameters: StudyUpdateParameter[], withReloading: boolean, isStudySaved: any) {
    this.loadingDialogService.showLoading('Saving changes, please wait a moment');

    this.studyCaseMainService.updateStudyParameters(
      studyParameters,
      studyId).subscribe(loadedStudy => {

        if (withReloading) {
          this.loadingDialogService.updateMessage(`Loading ontology`);
          // Prepare Ontology request inputs
          const ontologyRequest: PostOntology = {
            ontology_request: {
              disciplines: [],
              parameter_usages: []
            }
          };

          // Extract ontology input data from study
          const root = (loadedStudy as LoadedStudy).treeview.rootNode;
          TreenodeTools.recursiveTreenodeExtract(root, ontologyRequest);

          // Call ontology service
          this.ontologyService.loadOntologyStudy(ontologyRequest).subscribe(() => {

            //update ontology parameters in study
            this.studyCaseDataService.updateParameterOntology(loadedStudy);

            // Notify components observing study case status
            this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
            this.removeStudyParametersFromLocalStorage(studyId);
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation('All changes have been saved');
            isStudySaved(true);

          }, errorReceived => {
            // Reset ontology (make sure nothing was loaded)
            this.ontologyService.resetOntology();

            // Notify user
            this.snackbarService.showError(`Ontology not loaded, the following error occurs: ${errorReceived.description}`);
            this.studyCaseDataService.onStudyCaseChange.emit(loadedStudy);
            this.removeStudyParametersFromLocalStorage(studyId);
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation('All changes have been saved');
            isStudySaved(true);
          });
        } else {
          this.removeStudyParametersFromLocalStorage(studyId);
          this.loadingDialogService.closeLoading();
          // eslint-disable-next-line radix
          this.socketService.saveStudy(parseInt(studyId), studyParameters);
          this.socketService.leaveRoom(parseInt(studyId));
          this.studyCaseDataService.onStudyCaseChange.emit(null);
          this.snackbarService.showInformation('All changes have been saved');
          isStudySaved(true);
        }
      }, errorReceived => {
        const error = errorReceived as SoSTradesError;
        this.loadingDialogService.closeLoading();
        if (error.redirect) {
          this.snackbarService.showError(error.description);
        } else {
          this.snackbarService.showError('Error saving study case changes : ' + error.description);
        }
        isStudySaved(false);
      });
  }

  // Region study link management when login is requiered
  // Force usage of local storage to have persistence regarding login process (which redirect between web site)
  setStudyUrlRequestedInLocalStorage(studyUrl: string) {
    localStorage.setItem(StudyCaseLocalStorageAttributes.STUDYACCESSURL, studyUrl);
  }

  removeStudyUrlRequestedFromLocalStorage() {
    localStorage.removeItem(StudyCaseLocalStorageAttributes.STUDYACCESSURL);
  }

  getStudyUrlRequestedFromLocalStorage(): string {
    const studyIdRequested = localStorage.getItem(StudyCaseLocalStorageAttributes.STUDYACCESSURL);
    return studyIdRequested;
  }

}


export enum StudyCaseLocalStorageAttributes {
  STUDYPARAMETERLIST = 'studyParameterList',
  STUDYACCESSURL = 'studyAccessId'
}

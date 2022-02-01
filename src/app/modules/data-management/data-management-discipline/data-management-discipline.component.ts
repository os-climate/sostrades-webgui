import { ConditionalExpr } from '@angular/compiler';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataManagementDiscipline, PannelIds } from 'src/app/models/data-management-discipline.model';
import { StudyCaseValidationDialogData } from 'src/app/models/dialog-data.model';
import { NodeData } from 'src/app/models/node-data.model';
import { OntologyDiscipline } from 'src/app/models/ontology-discipline.model';
import { ValidationState, ValidationType } from 'src/app/models/study-case-validation.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { NodeDataTools } from 'src/app/tools/node-data.tools';
import { StudyCaseValidationDialogComponent } from '../../study-case/study-case-validation-dialog/study-case-validation-dialog.component';

@Component({
  selector: 'app-data-management-discipline',
  templateUrl: './data-management-discipline.component.html',
  styleUrls: ['./data-management-discipline.component.scss']
})
export class DataManagementDisciplineComponent implements OnInit, OnDestroy {

  @Input() disciplineData: DataManagementDiscipline;

  public countItemsInDict = NodeDataTools.countDisplayableItemsInNodeDataDict;

  public validationStates = ValidationState;
  public showMaturity: boolean;
  public isCalculationRunning: boolean;
  public modelDetails: string[][];

  public disciplinaryInputsOrdered: NodeData[];
  public disciplinaryOutputsOrdered: NodeData[];
  public numericalParametersOrdered: NodeData[];

  public isDisciplineDataValidated: boolean;


  public objectKey = Object.keys;

  calculationChangeSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private ontologyService: OntologyService,
    private calculationService: CalculationService,
    private studyCaseDataService: StudyCaseDataService,
    public studyCaseValidationService: StudyCaseValidationService,
    public filterService: FilterService) {
    this.isDisciplineDataValidated = false;
  }

  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isCalculationRunning) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  ngOnInit(): void {
    this.disciplinaryInputsOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.disciplinaryInputs);
    this.disciplinaryOutputsOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.disciplinaryOutputs);
    this.numericalParametersOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.numericalParameters);


    // Load model details
    this.modelDetails = null;
    if (this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]) !== null) {
      const ontologyInstance = this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]);
      this.modelDetails = Object.entries(this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]))
        .filter(entry => typeof entry[1] === 'string').map(entry => [OntologyDiscipline.getKeyLabel(entry[0]), entry[1]]);
    }

    if (this.disciplineData.maturity !== null && this.disciplineData.maturity.length > 0) {
      this.showMaturity = true;
    }

    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });

    //check if all disciplines are validate
    this.isDisciplineDataValidated = false;
    let nbDisciplineValidated = 0;
    this.disciplineData.disciplineKey.forEach(disciplinekey =>{
      if (this.studyCaseValidationService.studyDataValidationDict !== null && this.studyCaseValidationService.studyDataValidationDict !== undefined) {
        if (this.studyCaseValidationService.studyDataValidationDict.hasOwnProperty(disciplinekey)) {
          if (this.studyCaseValidationService.studyDataValidationDict[disciplinekey][0].validationState === ValidationState.VALIDATED) {
            nbDisciplineValidated = nbDisciplineValidated + 1;
          }
        }
      }
    });
    this.isDisciplineDataValidated = nbDisciplineValidated === this.disciplineData.disciplineKey.length;
      
    
  }


  ngOnDestroy() {
    if ((this.calculationChangeSubscription !== null) && (this.calculationChangeSubscription !== undefined)) {
      this.calculationChangeSubscription.unsubscribe();
    }
  }

  onClickDataValidation(event) {
    event.stopPropagation();
    event.preventDefault();

    
    const dialogData: StudyCaseValidationDialogData = new StudyCaseValidationDialogData();
    dialogData.disciplineName = this.disciplineData.modelNameFullPath[0]
    dialogData.namespace = this.disciplineData.namespace;
    dialogData.validationType = ValidationType.DATA
    if (this.isDisciplineDataValidated) {
      dialogData.validationState = ValidationState.VALIDATED;
    } else {
      dialogData.validationState = ValidationState.NOT_VALIDATED;
    }
    dialogData.validationList = [];
    dialogData.validationList = this.studyCaseValidationService.studyDataValidationDict[this.disciplineData.disciplineKey[0]];

    const dialogRefValidate = this.dialog.open(StudyCaseValidationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '800px',
      panelClass: 'csvDialog',
      data: dialogData
    });

    dialogRefValidate.afterClosed().subscribe(result => {
      const resultData: StudyCaseValidationDialogData = result as StudyCaseValidationDialogData;

      if ((resultData !== null) && (resultData !== undefined)) {
        if (resultData.cancel !== true) {
          this.isDisciplineDataValidated = !this.isDisciplineDataValidated;
        }
      }
    });
  }


  setCalculationCss(isCalculationRunning: boolean) {
    if (isCalculationRunning) {
      return 'execution-running';
    }
  }


  IsExpand(pannelID: string): boolean {
    var id = pannelID == "" ? this.disciplineData.disciplineKey[0] : `${this.disciplineData.disciplineKey[0]}.${pannelID}`;
    var defaultExpandable = pannelID == PannelIds.INPUTS || pannelID == "";
    return this.studyCaseDataService.GetUserStudyPreference(id, defaultExpandable);

  }

  SetIsExpand(pannelID: string, isExpand: boolean) {
    if (this.IsExpand(pannelID) != isExpand)//save data only if necessary
    {
      var id = pannelID == "" ? this.disciplineData.disciplineKey[0] : `${this.disciplineData.disciplineKey[0]}.${pannelID}`;
      this.studyCaseDataService.SetUserStudyPreference(id, isExpand).subscribe(
        _ => { },
        error => {
          //this.snackbarService.showError(error);
        });;
    }
  }
}

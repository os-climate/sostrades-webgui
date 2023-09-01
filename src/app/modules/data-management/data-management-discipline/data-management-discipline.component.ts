import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DataManagementDiscipline, PannelIds } from 'src/app/models/data-management-discipline.model';
import { NodeData } from 'src/app/models/node-data.model';
import { OntologyDiscipline } from 'src/app/models/ontology-discipline.model';
import { ValidationTreeNodeState } from 'src/app/models/study-case-validation.model';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { NodeDataTools } from 'src/app/tools/node-data.tools';

@Component({
  selector: 'app-data-management-discipline',
  templateUrl: './data-management-discipline.component.html',
  styleUrls: ['./data-management-discipline.component.scss']
})
export class DataManagementDisciplineComponent implements OnInit, OnDestroy {

  @Input() disciplineData: DataManagementDiscipline;

  public countItemsInDict = NodeDataTools.countDisplayableItemsInNodeDataDict;

  public validationStates = ValidationTreeNodeState;
  public showMaturity: boolean;
  public isCalculationRunning: boolean;
  public modelDetails: string[][];
  public disciplineIcon: string;
  public additionalLabel: string;

  public disciplinaryInputsOrdered: NodeData[];
  public disciplinaryOutputsOrdered: NodeData[];
  public numericalParametersOrdered: NodeData[];


  public objectKey = Object.keys;

  calculationChangeSubscription: Subscription;

  constructor(
    private ontologyService: OntologyService,
    private calculationService: CalculationService,
    private studyCaseDataService: StudyCaseDataService,
    public studyCaseValidationService: StudyCaseValidationService,
    public filterService: FilterService) {
  }

  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.isCalculationRunning) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  ngOnInit(): void {

    //because modelNameFullPath can not be unique, add the discipline label to define the name of the discipline
    this.additionalLabel = '';
    if (this.disciplineData.label !== 'Data' && this.disciplineData.showLabel)
    {
      this.additionalLabel = ` : ${this.disciplineData.label}`;
    }


    this.disciplinaryInputsOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.disciplinaryInputs);
    this.disciplinaryOutputsOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.disciplinaryOutputs);
    this.numericalParametersOrdered = NodeDataTools.createOrderedListFromNodeDataDict(this.disciplineData.numericalParameters);


    // Load model details
    this.modelDetails = null;
    if (this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]) !== null) {
      const ontologyInstance = this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]);
      this.modelDetails = Object.entries(this.ontologyService.getDiscipline(this.disciplineData.modelNameFullPath[0]))
        .filter(entry => typeof entry[1] === 'string').map(entry => [OntologyDiscipline.getKeyLabel(entry[0]), entry[1]]);
      
      // get discipline icon
      if (this.modelDetails.find(entry => entry[0]==='icon') !== undefined){
        this.disciplineIcon = this.modelDetails.find(entry => entry[0]==='icon')[1];
      }
    
    }
    
    if (this.disciplineData.maturity !== null && this.disciplineData.maturity.length > 0) {
      this.showMaturity = true;
    }

    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });
      
  }


  ngOnDestroy() {
    if ((this.calculationChangeSubscription !== null) && (this.calculationChangeSubscription !== undefined)) {
      this.calculationChangeSubscription.unsubscribe();
    }
  }


  setCalculationCss(isCalculationRunning: boolean) {
    //if (isCalculationRunning) {
    //  return 'execution-running';
    //}
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

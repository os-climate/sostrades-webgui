import { Component, OnInit, OnDestroy,Input, HostListener } from '@angular/core';
import { TreeNodeDataService } from '../../../services/tree-node-data.service';
import { TreeNode } from '../../../models/tree-node.model';
import { IoType, WidgetType } from '../../../models/node-data.model';
import { Subscription } from 'rxjs';
import { FilterService } from 'src/app/services/filter/filter.service';
import { MatDialog } from '@angular/material/dialog';
import { DataManagementInformationComponent } from 'src/app/modules/data-management/data-management-information/data-management-information.component';
import { NodeDataTools } from 'src/app/tools/node-data.tools';
import { DataManagementDiscipline } from 'src/app/models/data-management-discipline.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { StudyCaseValidationDialogData } from 'src/app/models/dialog-data.model';
import { ValidationTreeNodeState } from 'src/app/models/study-case-validation.model';
import { StudyCaseValidationDialogComponent } from '../../study-case/study-case-validation-dialog/study-case-validation-dialog.component';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { LoadedStudy } from 'src/app/models/study.model';

@Component({
  selector: 'app-data-management-container',
  templateUrl: './data-management-container.component.html',
  styleUrls: ['./data-management-container.component.scss']
})
export class DataManagementContainerComponent implements OnInit, OnDestroy {


  @Input() disciplineData: DataManagementDiscipline;


  public resultData: StudyCaseValidationDialogData;
  public showMaturity: boolean;
  public countItemsInDict = NodeDataTools.countDisplayableItemsInNodeDataDict;
  public treeNodeData: TreeNode;
  //dict of display of each discipline
  public allDisciplinesDataDict: { [id: string]: DataManagementDiscipline };
  //dict of one simple display of all data
  public allDataDict: { [id: string]: DataManagementDiscipline };
  public objectKey = Object.keys;
  public objectValue = Object.values;

  public loadedStudy: LoadedStudy;

  treeNodeDataSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseValidationService: StudyCaseValidationService,
    public filterService: FilterService) {
    this.treeNodeDataSubscription = null;
    this.allDisciplinesDataDict = {};
    this.allDataDict = {};
    this.showMaturity = false;
    this.loadedStudy = null;
  }

  ngOnInit() {

    // Get data from treeview clicked node
    this.treeNodeDataSubscription = this.treeNodeDataService.currentTreeNodeData.subscribe(data => {

      this.loadedStudy = this.studyCaseDataService.loadedStudy;

      if (data !== null) {
        if (data.name !== null) {
          this.treeNodeData = data;
        }

        if (this.treeNodeData) { // Secure Route is called from treeview

          if (this.treeNodeData.maturity.length > 0) {
            this.showMaturity = true;
          }

          // Reset all disciplines data in current node
          this.allDisciplinesDataDict = {} //this dict contains a DataManagementDiscipline for each discipline
          this.allDataDict = {};//this dict contains only one DataManagementDiscipline that contains all disciplines


          // Create entry for data stored at this treenode without discipline
          this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`] = new DataManagementDiscipline();
          this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].modelNameFullPath.push('Data');
          this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].namespace = this.treeNodeData.fullNamespace;
          this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplineKey.push(`${this.treeNodeData.fullNamespace}.Data`);

          //create entry for all data stored in this treenode (for standard mode view)
          //Reset all datda in current node
          this.allDataDict[`Data-${this.treeNodeData.identifier}`] = new DataManagementDiscipline();
          this.allDataDict[`Data-${this.treeNodeData.identifier}`].modelNameFullPath.push('Data');
          this.allDataDict[`Data-${this.treeNodeData.identifier}`].namespace = this.treeNodeData.fullNamespace;
          this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplineKey.push(`${this.treeNodeData.fullNamespace}.Data`);

          // Create entries for data with discipline
          this.treeNodeData.modelsFullPathList.forEach(discName => {
            this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`] = new DataManagementDiscipline();
            this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].modelNameFullPath.push(discName);
            this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].namespace = this.treeNodeData.fullNamespace;
            this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplineKey.push(`${this.treeNodeData.fullNamespace}.${discName}`);
            this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplineKey.push(`${this.treeNodeData.fullNamespace}.${discName}`);
            this.allDataDict[`Data-${this.treeNodeData.identifier}`].modelNameFullPath.push(discName);
          });




          // Reading all data to create object config, couplingInputs, couplingOutputs
          Object.keys(this.treeNodeData.data).forEach(key => {
            const variable = this.treeNodeData.data[key];

            if (variable.widgetType !== WidgetType.NO_WIDGET) {
              if (variable.numerical === true) { // Numerical parameters
                // Add to Data
                if (variable.disciplineFullPathList.length === 0) {
                  this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters[variable.identifier] = variable;
                  // Add to Disciplines data
                } else {
                  variable.disciplineFullPathList.forEach(discName => {
                    this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].numericalParameters[variable.identifier] = variable;
                  });
                }
                this.allDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters[variable.identifier] = variable;

              } else if (variable.ioType === IoType.IN) { // Disciplinary inputs
                // Add to Data
                if (variable.disciplineFullPathList.length === 0) {
                  this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs[variable.identifier] = variable;
                  // Add to Disciplines data
                } else {
                  variable.disciplineFullPathList.forEach(discName => {
                    this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryInputs[variable.identifier] = variable;
                  });
                }
                this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs[variable.identifier] = variable;

              } else if (variable.ioType === IoType.OUT) { // Disciplinary outputs
                // Add to Data
                if (variable.disciplineFullPathList.length === 0) {
                  this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs[variable.identifier] = variable;
                  // Add to Disciplines data
                } else {
                  variable.disciplineFullPathList.forEach(discName => {
                    this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryOutputs[variable.identifier] = variable;
                  });
                }
                this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs[variable.identifier] = variable;
              }
            }
          });

          // Adding supplementary discipline inputs and outputs
          Object.keys(this.treeNodeData.dataDisc).forEach(key => {
            const discVariable = this.treeNodeData.dataDisc[key];

            if (discVariable.widgetType !== WidgetType.NO_WIDGET) {

              // Check if variable already exists
              if (discVariable.numerical === true) { // Numerical parameters
                // Add to Data
                if (discVariable.disciplineFullPathList.length === 0) {
                  if (!(discVariable.identifier in this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters)) {
                    discVariable.editable = false; // Read only data
                    this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters[discVariable.identifier] = discVariable;
                    this.allDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters[discVariable.identifier] = discVariable;
                  }
                  // Add to Disciplines data
                } else {
                  discVariable.disciplineFullPathList.forEach(discName => {
                    if (!(discVariable.identifier in this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].numericalParameters)) {
                      discVariable.editable = false; // Read only data
                      this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].numericalParameters[discVariable.identifier] = discVariable;
                      this.allDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters[discVariable.identifier] = discVariable;
                    }
                  });
                }


              } else if (discVariable.ioType === IoType.IN) { // Disciplinary inputs
                // Add to Data
                if (discVariable.disciplineFullPathList.length === 0) {
                  if (!(discVariable.identifier in this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs)) {
                    discVariable.editable = false; // Read only data
                    this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs[discVariable.identifier] = discVariable;
                    this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs[discVariable.identifier] = discVariable;
                  }
                  // Add to Disciplines data
                } else {
                  discVariable.disciplineFullPathList.forEach(discName => {
                    if (!(discVariable.identifier in this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryInputs)) {
                      discVariable.editable = false; // Read only data
                      this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryInputs[discVariable.identifier] = discVariable;
                      this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs[discVariable.identifier] = discVariable;
                    }
                  });
                }

              } else if (discVariable.ioType === IoType.OUT) { // Disciplinary outputs
                // Add to Data
                if (discVariable.disciplineFullPathList.length === 0) {
                  if (!(discVariable.identifier in this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs)) {
                    discVariable.editable = false; // Read only data
                    this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs[discVariable.identifier] = discVariable;
                    this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs[discVariable.identifier] = discVariable;
                  }
                  // Add to Disciplines data
                } else {
                  discVariable.disciplineFullPathList.forEach(discName => {
                    if (!(discVariable.identifier in this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryOutputs)) {
                      discVariable.editable = false; // Read only data
                      this.allDisciplinesDataDict[`${discName}-${this.treeNodeData.identifier}`].disciplinaryOutputs[discVariable.identifier] = discVariable;
                      this.allDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs[discVariable.identifier] = discVariable;
                    }
                  });
                }

              }
            }
          });

          // Remove Data "discipline" if no data at this treenode
          if (Object.keys(this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].numericalParameters).length === 0
            && Object.keys(this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryInputs).length === 0
            && Object.keys(this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`].disciplinaryOutputs).length === 0) {
            delete this.allDisciplinesDataDict[`Data-${this.treeNodeData.identifier}`];
          }

        }
      }
    });

  }

  onShowConfigureInformation() {
    const dialogRef = this.dialog.open(DataManagementInformationComponent, {
      disableClose: false
    });
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
  }
  onClickDataValidation(event) {
    event.stopPropagation();
    event.preventDefault();


    const dialogData: StudyCaseValidationDialogData = new StudyCaseValidationDialogData();
    dialogData.namespace = this.treeNodeData.fullNamespace;

    if (this.treeNodeData.isValidated) {
      dialogData.validationState = ValidationTreeNodeState.INVALIDATED;
    } else {
      dialogData.validationState = ValidationTreeNodeState.VALIDATED;
    }

    const dialogRefValidate = this.dialog.open(StudyCaseValidationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '600px',
      panelClass: 'csvDialog',
      data: this.treeNodeData
    });

    dialogRefValidate.afterClosed().subscribe(() => {
         if(this.treeNodeData.isValidated){
             this.treeNodeData.isValidated =false
           }
         else {
          this.treeNodeData.isValidated =true
         }
    });
  }

}



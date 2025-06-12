import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { TreeNodeDataService } from '../../../services/tree-node-data.service';
import { TreeNode } from '../../../models/tree-node.model';
import { Subscription } from 'rxjs';
import { FilterService } from 'src/app/services/filter/filter.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataManagementInformationComponent } from 'src/app/modules/data-management/data-management-information/data-management-information.component';
import { NodeDataTools } from 'src/app/tools/node-data.tools';
import { DataManagementDiscipline } from 'src/app/models/data-management-discipline.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { TreeNodeDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseValidation, ValidationTreeNodeState } from 'src/app/models/study-case-validation.model';
import { StudyCaseValidationDialogComponent } from '../../study-case/study-case-validation-dialog/study-case-validation-dialog.component';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { LoadedStudy } from 'src/app/models/study.model';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { StudyCaseLoadingService } from 'src/app/services/study-case-loading/study-case-loading.service';

@Component({
  selector: 'app-data-management-container',
  templateUrl: './data-management-container.component.html',
  styleUrls: ['./data-management-container.component.scss']
})
export class DataManagementContainerComponent implements OnInit, OnDestroy {


  @Input() disciplineData: DataManagementDiscipline;


  public showMaturity: boolean;
  public countItemsInDict = NodeDataTools.countDisplayableItemsInNodeDataDict;
  public treeNodeData: TreeNode;
  // dict of display of each discipline
  public allDisciplinesDataDict: { [id: string]: DataManagementDiscipline };
  // dict of one simple display of all data
  public allDataDict: { [id: string]: DataManagementDiscipline };
  public objectKey = Object.keys;
  public objectValue = Object.values;

  public loadedStudy: LoadedStudy;

  private dialogRef: MatDialogRef<DataManagementInformationComponent>;
  private dialogRefValidate: MatDialogRef<StudyCaseValidationDialogComponent>;
  treeNodeDataSubscription: Subscription;
  validationChangeSubcription: Subscription;

  constructor(
    private dialog: MatDialog,
    private treeNodeDataService: TreeNodeDataService,
    private socketService: SocketService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    public studyCaseLoadingService: StudyCaseLoadingService,
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
          // this dict contains a DataManagementDiscipline for each discipline
          this.allDisciplinesDataDict = {};
          // this dict contains only one DataManagementDiscipline that contains all disciplines
          this.allDataDict = {};

          this.allDataDict[`Data`] = new DataManagementDiscipline();
          this.allDataDict[`Data`].modelNameFullPath.push('Data');
          this.allDataDict[`Data`].label = 'Data';
          this.allDataDict[`Data`].namespace = this.treeNodeData.fullNamespace;
          this.allDataDict[`Data`].disciplineKey.push(`${this.treeNodeData.fullNamespace}.Data`);

          Object.keys(this.treeNodeData.dataManagementDisciplineDict).forEach(key => {
            this.allDisciplinesDataDict[key] = this.treeNodeData.dataManagementDisciplineDict[key]
            this.allDataDict["Data"].numericalParameters = Object.assign({}, this.allDataDict["Data"].numericalParameters, this.treeNodeData.dataManagementDisciplineDict[key].numericalParameters);
            this.allDataDict["Data"].disciplinaryInputs = Object.assign({}, this.allDataDict["Data"].disciplinaryInputs, this.treeNodeData.dataManagementDisciplineDict[key].disciplinaryInputs);
            this.allDataDict["Data"].disciplinaryOutputs = Object.assign({}, this.allDataDict["Data"].disciplinaryOutputs, this.treeNodeData.dataManagementDisciplineDict[key].disciplinaryOutputs);
          });
        }
      }
    });

    this.validationChangeSubcription = this.socketService.onNodeValidatationChange.subscribe(validationChange => {
      const newValidationChange = StudyCaseValidation.Create(validationChange);
      Object.values(this.studyCaseDataService.loadedStudy.treeview.rootDict).forEach((element) => {
        if (element.fullNamespace == newValidationChange.namespace) {
          element.isValidated = newValidationChange.validationState === ValidationTreeNodeState.VALIDATED;
        }
      });
    });
  }

  onShowConfigureInformation() {
    this.dialogRef = this.dialog.open(DataManagementInformationComponent, {
      disableClose: false
    });
  }

  ngOnDestroy() {
    if ((this.treeNodeDataSubscription !== null) && (this.treeNodeDataSubscription !== undefined)) {
      this.treeNodeDataSubscription.unsubscribe();
    }
    if ((this.validationChangeSubcription !== null) && (this.validationChangeSubcription !== undefined)) {
      this.validationChangeSubcription.unsubscribe();
    }
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    if (this.dialogRefValidate !== null && this.dialogRefValidate !== undefined) {
      this.dialogRefValidate.close();
      this.dialogRefValidate = null;
    }
  }

  onClickDataValidation(event) {
    event.stopPropagation();
    event.preventDefault();


    const treeNodedialogData = new TreeNodeDialogData();
    treeNodedialogData.node = this.treeNodeData;


    this.dialogRefValidate = this.dialog.open(StudyCaseValidationDialogComponent, {
      disableClose: true,
      width: '1100px',
      height: '600px',
      panelClass: 'csvDialog',
      data: treeNodedialogData
    });

    this.dialogRefValidate.afterClosed().subscribe((result) => {
       const validation: TreeNodeDialogData = result as  TreeNodeDialogData;
       if (validation.cancel !== true) {
         if (this.studyCaseValidationService.studyValidationDict[`${ this.treeNodeData.fullNamespace}`][0].validationState == ValidationTreeNodeState.VALIDATED) {
          this.treeNodeData.isValidated = true;
        } else {
          this.treeNodeData.isValidated = false;
        }
       }
    });
  }

}

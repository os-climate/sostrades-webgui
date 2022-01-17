import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { StudyCaseTreeNodeValidation, ValidationState, ValidationTreeNodeState, ValidationType } from 'src/app/models/study-case-validation.model';
import { TreeNode, TreeView } from 'src/app/models/tree-node.model';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseValidationService } from 'src/app/services/study-case-validation/study-case-validation.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';

@Component({
  selector: 'app-study-case-validation-sum-up',
  templateUrl: './study-case-validation-sum-up.component.html',
  styleUrls: ['./study-case-validation-sum-up.component.scss']
})

export class StudyCaseValidationSumUpComponent implements OnInit {

  public validationType = ValidationType;
  public isLoading: boolean;

  private root: TreeView;
  public dataSource: MatTreeNestedDataSource<TreeNode>;
  public treeControl: NestedTreeControl<TreeNode>;
  public originTreeNode: TreeNode;

  public studyTreeNodeValidationDict: { [id: string]: StudyCaseTreeNodeValidation; };

  constructor(
    private snackbarService: SnackbarService,
    public studyCaseValidationService: StudyCaseValidationService,
    public studyCaseDataService: StudyCaseDataService,) {
    this.dataSource = new MatTreeNestedDataSource();
    this.treeControl = new NestedTreeControl<TreeNode>(this.getChildren);
    this.studyTreeNodeValidationDict = {};
    this.isLoading = true;
  }

  hasChild = (index: number, node: TreeNode) => {
    return this.getChildren(node).length > 0;
  }

  getChildren = (node: TreeNode) => {
    return node.children.value;
  }

  ngOnInit(): void {
    this.refreshValidation(false);
  }

  refreshValidation(withSnackbarInfo: boolean) {
    this.isLoading = true;
    this.root = this.studyCaseDataService.loadedStudy.treeview;
    this.originTreeNode = this.root.rootNode;
    this.dataSource.data = [this.originTreeNode];
    this.generateEmptyStudyValidationFromTreeNode(this.originTreeNode);
    this.generateValidationStatusForEachTreeNode();
    this.treeControl.expand(this.originTreeNode);
    this.isLoading = false;
    if (withSnackbarInfo) {
      this.snackbarService.showInformation("Data & Graph successfully reloaded");
    }
  }

  generateEmptyStudyValidationFromTreeNode(treenode: TreeNode) {
    if (treenode !== undefined && treenode !== null) {

      if (Object.keys(treenode.data).length > 0) {
        Object.keys(treenode.data).forEach(key => {
          const variable = treenode.data[key];
          if (variable.disciplineFullPathList.length === 0) {
            this.addTreeNodeToValidationDict(treenode, 'Data', ValidationType.DATA);
          } else {
            variable.disciplineFullPathList.forEach(discName => {
              this.addTreeNodeToValidationDict(treenode, discName, ValidationType.DATA);
            });
          }
        });
      }

      if (Object.keys(treenode.dataDisc).length > 0) {
        Object.keys(treenode.dataDisc).forEach(key => {
          const variable = treenode.dataDisc[key];
          if (variable.disciplineFullPathList.length === 0) {
            this.addTreeNodeToValidationDict(treenode, 'Data', ValidationType.DATA);
          } else {
            variable.disciplineFullPathList.forEach(discName => {
              this.addTreeNodeToValidationDict(treenode, discName, ValidationType.DATA);
            });
          }
        });
      }

      if (treenode.postProcessingBundle !== undefined && treenode.postProcessingBundle !== null && treenode.postProcessingBundle.length > 0) {
        treenode.postProcessingBundle.forEach(bundle => {
          this.addTreeNodeToValidationDict(treenode, bundle.name, ValidationType.GRAPH);
        });
      }

      if (treenode.children.value.length > 0) {
        treenode.children.value.forEach(tn => {
          this.generateEmptyStudyValidationFromTreeNode(tn);
        });
      }
    }
  }

  addTreeNodeToValidationDict(treeNode: TreeNode, discName: string, validationType: ValidationType) {
    if (!this.studyTreeNodeValidationDict.hasOwnProperty(treeNode.fullNamespace)) {
      this.studyTreeNodeValidationDict[treeNode.fullNamespace] = new StudyCaseTreeNodeValidation();
      this.studyTreeNodeValidationDict[treeNode.fullNamespace].fullNamespace = treeNode.fullNamespace
      this.studyTreeNodeValidationDict[treeNode.fullNamespace].disciplineList.push(discName);
    } else if (!this.studyTreeNodeValidationDict[treeNode.fullNamespace].disciplineList.includes(discName)) {
      this.studyTreeNodeValidationDict[treeNode.fullNamespace].disciplineList.push(discName);
    }

    if (validationType === ValidationType.DATA) {
      this.studyTreeNodeValidationDict[treeNode.fullNamespace].hasData = true;
    } else if (validationType === ValidationType.GRAPH) {
      this.studyTreeNodeValidationDict[treeNode.fullNamespace].hasGraph = true;
    }
  }


  generateValidationStatusForEachTreeNode() {

    Object.keys(this.studyTreeNodeValidationDict).forEach(key => {
      this.studyTreeNodeValidationDict[key].validationDataState = this.setStatusForTreeNode(this.studyTreeNodeValidationDict[key],
        ValidationType.DATA);

      this.studyTreeNodeValidationDict[key].validationGraphState = this.setStatusForTreeNode(this.studyTreeNodeValidationDict[key],
        ValidationType.GRAPH);
    });
  }

  setStatusForTreeNode(studyValTreeNode: StudyCaseTreeNodeValidation, validationType: ValidationType): ValidationTreeNodeState {
    const discCount = studyValTreeNode.disciplineList.length;

    let validatedCounter = 0;
    let invalidatedCounter = 0;

    let valDict = null;
    if (validationType == ValidationType.DATA) {
      valDict = this.studyCaseValidationService.studyDataValidationDict;
    } else if (validationType == ValidationType.GRAPH) {
      valDict = this.studyCaseValidationService.studyGraphValidationDict;
    }

    studyValTreeNode.disciplineList.forEach(discName => {
      if (valDict.hasOwnProperty(`${studyValTreeNode.fullNamespace}.${discName}`)) {
        if (valDict[`${studyValTreeNode.fullNamespace}.${discName}`] !== undefined
          && valDict[`${studyValTreeNode.fullNamespace}.${discName}`] !== null
          && valDict[`${studyValTreeNode.fullNamespace}.${discName}`].length > 0) {
          if (valDict[`${studyValTreeNode.fullNamespace}.${discName}`][0].validationState == ValidationState.VALIDATED) {
            validatedCounter += 1;
          } else {
            invalidatedCounter += 1;
          }
        }
      }
    });

    if (validatedCounter === discCount) {
      return ValidationTreeNodeState.VALIDATED;

    } else if (invalidatedCounter === discCount) {
      return ValidationTreeNodeState.INVALIDATED;

    } else if (validatedCounter < discCount && validatedCounter > 0) {
      return ValidationTreeNodeState.PARTIAL_VALIDATION;

    } else {
      return ValidationTreeNodeState.INVALIDATED;
    }
  }

  getColorForTreeNode(fullNamespace: string, validationType: ValidationType): string {
    let color = null;
    let currentState = null;
    if (this.studyTreeNodeValidationDict.hasOwnProperty(fullNamespace)) {
      if (validationType === ValidationType.DATA) {
        currentState = this.studyTreeNodeValidationDict[fullNamespace].validationDataState
      } else if (validationType === ValidationType.GRAPH) {
        currentState = this.studyTreeNodeValidationDict[fullNamespace].validationGraphState
      }
    }
    if (currentState !== null && currentState !== undefined) {
      if (currentState === ValidationTreeNodeState.PARTIAL_VALIDATION) {
        color = 'warning'
      } else if (currentState === ValidationTreeNodeState.VALIDATED) {
        color = 'success'
      } else if (currentState === ValidationTreeNodeState.INVALIDATED) {
        color = 'undetermined'
      }
    }
    return color;
  }
}

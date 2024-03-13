import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NodeData, IoType, ProcessBuilderData } from 'src/app/models/node-data.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseCreationService } from 'src/app/services/study-case/study-case-creation/study-case-creation.service';


@Component({
  selector: 'app-process-builder',
  templateUrl: './process-builder.component.html',
  styleUrls: ['./process-builder.component.scss']
})
export class ProcessBuilderComponent implements OnInit, OnDestroy {

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  public displayShowButton: boolean;
  public isReadOnly: boolean;

  constructor(
    private ontologyService: OntologyService,
    private snackbarService: SnackbarService,
    private studyCaseCreationService: StudyCaseCreationService) {

    this.isReadOnly = true;
  }

  ngOnInit(): void {
    if (this.nodeData !== null && this.nodeData !== undefined) {
      if (this.nodeData.editable === true && this.nodeData.ioType !== IoType.OUT) {
        this.isReadOnly = false;
      }
    }
  }

  ngOnDestroy() {
   this.studyCaseCreationService.closeStudyCaseCreationDialog();
  }

  onClickShow() {
    this.openProcessBuilderEditor(true);
  }

  onClickEdit() {
    this.openProcessBuilderEditor(false);
  }

  openProcessBuilderEditor(readOnly: boolean) {
    let name = '';

    // Handle data naming
    const ontologyParameter = this.ontologyService.getParameter(this.nodeData.variableKey);
    if (ontologyParameter !== null
      && ontologyParameter !== undefined) {
      if (ontologyParameter.label !== null
        && ontologyParameter.label !== undefined) {
        name = ontologyParameter.label;
      }
    }

    if (name === null || name === '') {
      name = this.nodeData.displayName;
    }

    if (this.nodeData) {

      const nodeDataValue = this.nodeData.value;

      const processBuilderData = ProcessBuilderData.Create(nodeDataValue);

      this.studyCaseCreationService.selectProcess(processBuilderData).subscribe({
        next: (result) => {
          if (result.cancel === false) {
            processBuilderData.processRepositoryIdentifier = result.process.repositoryId;
            processBuilderData.processIdentifier = result.process.processId;
            processBuilderData.usecaseInfoName = result.reference;
            processBuilderData.usecaseInfoType = result.studyType;
            processBuilderData.usecaseInfoIdentifier = result.studyId;
      
            this.nodeData.value = processBuilderData.toNodeDataValue();
            this.valueChanged.emit(this.nodeData.value);
          }
        },
        error: (error) => {
          this.snackbarService.showError(error);
        }
      });
    }
  }
}

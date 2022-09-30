import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NodeData, IoType, ProcessBuilderAttribute, ProcessBuilderData } from 'src/app/models/node-data.model';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { SpreadsheetDialogData } from 'src/app/models/dialog-data.model';
import { StudyCaseCreationService } from 'src/app/services/study-case/study-case-creation/study-case-creation.service';


@Component({
  selector: 'app-process-builder',
  templateUrl: './process-builder.component.html',
  styleUrls: ['./process-builder.component.scss']
})
export class ProcessBuilderComponent implements OnInit {

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();

  public displayShowButton: boolean;
  public isReadOnly: boolean;

  constructor(
    private ontologyService: OntologyService,
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

      this.studyCaseCreationService.selectProcess(processBuilderData).subscribe(result => {

        if (result.cancel === false) {
          processBuilderData.processRepositoryIdentifier = result.process.repositoryId;
          processBuilderData.processIdentifier = result.process.processId;
          processBuilderData.usecaseInfoName = result.reference;
          processBuilderData.usecaseInfoType = result.studyType;
          processBuilderData.usecaseInfoIdentifier = result.studyId;

          this.nodeData.value = processBuilderData.toNodeDataValue();
          console.log(this.nodeData.value);
          this.valueChanged.emit(this.nodeData.value);

        }
      }, error => {
        console.log(error);
      });
    }
  }
}

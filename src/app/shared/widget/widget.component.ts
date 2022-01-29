import { Component, OnInit, Input } from '@angular/core';
import { NodeData, WidgetType, ValueType, IoType } from 'src/app/models/node-data.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatDialog } from '@angular/material/dialog';
import { OntologyInformationsDialogData } from 'src/app/models/dialog-data.model';
import { OntologyInformationsComponent } from 'src/app/modules/ontology/ontology-informations/ontology-informations.component';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})

export class WidgetComponent implements OnInit {

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;

  public widgetType: WidgetType;

  constructor(
    private dialog: MatDialog,
    private studyCaseDataService: StudyCaseDataService,
    public ontologyService: OntologyService,
    private studyCaselocalStorageService: StudyCaseLocalStorageService,
    public filterService: FilterService,
    private snackbarService: SnackbarService) {

  }

  ngOnInit(): void {
    this.widgetType = this.nodeData.widgetType;
  }

  public onInputChange(value) {
    let updateItem: StudyUpdateParameter;

    updateItem = new StudyUpdateParameter(
      this.nodeData.identifier,
      this.nodeData.type.toString(),
      UpdateParameterType.SCALAR,
      this.namespace,
      this.discipline,
      value,
      this.nodeData.oldValue,
      null,
      new Date());

    this.nodeData.value = value;

    this.studyCaselocalStorageService.setStudyParametersInLocalStorage(
      updateItem,
      this.nodeData.identifier,
      this.studyCaseDataService.loadedStudy.studyCase.id.toString());

    this.snackbarService.showInformation(`${this.nodeData.displayName} added to temporary changes`);
  }

  get borderClass(): string {
    switch (this.nodeData.valueType) {
      case ValueType.EMPTY:
        return 'border-empty';
        break;
      case ValueType.USER:
        return 'border-user';
        break;
      case ValueType.DEFAULT:
        return 'border-default';
        break;
      case ValueType.READ_ONLY:
        return 'border-readonly';
        break;
      case ValueType.OPTIONAL:
        return 'border-optional';
        break;
      default:
        return 'border-empty';
        break;
    }
  }

  get headerIcon(): string {
    switch (this.nodeData.valueType) {
      case ValueType.EMPTY:
        return 'error';
        break;
      case ValueType.USER:
        return 'create';
        break;
      case ValueType.DEFAULT:
        return 'settings_applications';
        break;
      case ValueType.READ_ONLY:
        return 'visibility';
        break;
      case ValueType.OPTIONAL:
        return 'check_box_outline_blank';
        break;
      default:
        return 'indeterminate_check_box';
        break;
    }
  }
  showOntologyInformations() {
    const dialogData: OntologyInformationsDialogData = new OntologyInformationsDialogData();
    dialogData.displayName = this.nodeData.displayName;
    dialogData.name = this.nodeData.identifier;
    dialogData.unit = this.nodeData.unit;
    dialogData.nodeData = this.nodeData;
    dialogData.discipline = this.discipline;
    dialogData.namespace = this.namespace;

    const dialogRef = this.dialog.open(OntologyInformationsComponent, {
      disableClose: false,
      width: '950px',
      height: '650px',
      data: dialogData
    });
  }

  showWidget(userLevel: number, showReadOnly: boolean): boolean {
    if (userLevel >= this.nodeData.userLevel) {
      if (this.nodeData.valueType === ValueType.READ_ONLY) {
        if (this.nodeData.ioType === IoType.IN && !showReadOnly) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}

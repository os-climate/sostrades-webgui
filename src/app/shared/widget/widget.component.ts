import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NodeData, WidgetType, ValueType, IoType } from 'src/app/models/node-data.model';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { StudyUpdateParameter, UpdateParameterType } from 'src/app/models/study-update.model';
import { StudyCaseLocalStorageService } from 'src/app/services/study-case-local-storage/study-case-local-storage.service';
import { OntologyService } from 'src/app/services/ontology/ontology.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OntologyInformationsDialogData } from 'src/app/models/dialog-data.model';
import { OntologyInformationsComponent } from 'src/app/modules/ontology/ontology-informations/ontology-informations.component';
import { CalculationService } from 'src/app/services/calculation/calculation.service';
import { Subscription } from 'rxjs';
import { DisciplineStatus } from 'src/app/models/study-case-execution-observer.model';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})

export class WidgetComponent implements OnInit, OnDestroy {

  private static BASE_INTEGRITY_TOOLTIP_CLASS = 'custom-tooltip-class';

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;

  public widgetType: WidgetType;
  public isCalculationRunning: boolean;
  calculationChangeSubscription: Subscription;
  private borderClassMapping: Record<ValueType, string>;
  private iconClassMapping: Record<ValueType, string>;
  public borderClass: string;
  public headerIconClass: string;

  private baseIntegrityTooltipClass: string;
  public integrityTooltipClass: string;

  public widgetIntegrityMessage: string;
  public integrityMessageClass: string;
  private dialogRef: MatDialogRef<OntologyInformationsComponent>;

  constructor(
    private dialog: MatDialog,
    private calculationService: CalculationService,
    private studyCaseDataService: StudyCaseDataService,
    public ontologyService: OntologyService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    public filterService: FilterService,
    private snackbarService: SnackbarService) {

    this.isCalculationRunning = false;

    this.borderClassMapping = {
      [ValueType.EMPTY]: 'border-empty',
      [ValueType.USER]: 'border-user',
      [ValueType.DEFAULT]: 'border-default',
      [ValueType.READ_ONLY]: 'border-readonly',
      [ValueType.OPTIONAL]: 'border-optional'
    };

    this.iconClassMapping = {
      [ValueType.EMPTY]: 'error',
      [ValueType.USER]: 'create',
      [ValueType.DEFAULT]: 'settings_applications',
      [ValueType.READ_ONLY]: 'visibility',
      [ValueType.OPTIONAL]: 'check_box_outline_blank'
    };

    this.baseIntegrityTooltipClass = 'custom-tooltip-class';
    this.integrityTooltipClass = this.baseIntegrityTooltipClass;
    this.widgetIntegrityMessage = '';
    this.integrityMessageClass = 'error-message error-message-color-red';
  }

  ngOnInit(): void {
    const status = this.studyCaseDataService.loadedStudy.treeview.rootNode.status;
    this.isCalculationRunning = status === DisciplineStatus.STATUS_RUNNING || status === DisciplineStatus.STATUS_PENDING;
    this.widgetType = this.nodeData.widgetType;
    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });

    this.SetBorderClass();
    this.SetHeaderIconClass();
  }

  ngOnDestroy(): void {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }


  public onInputChange(value) {
    let updateItem: StudyUpdateParameter;

    updateItem = new StudyUpdateParameter(
      this.nodeData.identifier,
      this.nodeData.type.toString(),
      UpdateParameterType.SCALAR,
      null,
      this.namespace,
      this.discipline,
      value,
      this.nodeData.oldValue,
      null,
      new Date(),
      null,
      null,
      null,
      null,
      null);

    this.nodeData.value = value;

    this.studyCaseLocalStorageService.setStudyParametersInLocalStorage(
      updateItem,
      this.nodeData,
      this.studyCaseDataService.loadedStudy.studyCase.id.toString());

    this.snackbarService.showInformation(`${this.nodeData.displayName} added to temporary changes`);
    this.onStateUpdate();
  }

  public onStateUpdate() {
    this.SetBorderClass();
    this.SetHeaderIconClass();
  }

  /**
   * Read-only property that determine border css class to use regarding data state
   */
  private SetBorderClass() {
    /**
     * Manage integrity check, if a message is present AND no changes have already been made on the according
     * parameter, then considered the parameter as Empty (error)
     */

    let result = this.borderClassMapping[ValueType.EMPTY];

    if (this.nodeData.checkIntegrityMessage !== undefined &&
      this.nodeData.checkIntegrityMessage !== null &&
      this.nodeData.checkIntegrityMessage.length > 0) {

      if (this.nodeData.modified === false) {
        result = this.borderClassMapping[ValueType.EMPTY];
        this.integrityTooltipClass = `${WidgetComponent.BASE_INTEGRITY_TOOLTIP_CLASS} background-red`;
        this.widgetIntegrityMessage = this.nodeData.checkIntegrityMessage;
        this.integrityMessageClass = 'error-message error-message-color-red';
      } else {
        result = 'border-value-change-with-integrity-message';
        this.integrityTooltipClass = `${WidgetComponent.BASE_INTEGRITY_TOOLTIP_CLASS} background-dark-orange`;
        this.widgetIntegrityMessage = `${this.nodeData.checkIntegrityMessage} (save changes to update message)`;
        this.integrityMessageClass = 'error-message error-message-color-dark-orange';

      }
    } else {
      result = this.borderClassMapping[this.nodeData.valueType] || this.borderClassMapping[ValueType.EMPTY];
    }

    this.borderClass = result;
  }

  /**
   * Read-only property that determine icon css class to use regarding data state
   */
  private SetHeaderIconClass() {
    this.headerIconClass = this.iconClassMapping[this.nodeData.valueType] || 'indeterminate_check_box';
  }

  get headerIconColor(): string {
    switch (this.nodeData.valueType) {
      case ValueType.EMPTY:
        return 'red-icon';
        break;
      default:
        return '';
        break;
    }
  }

  setCalculationCss(isCalculationRunning: boolean) {
    if (isCalculationRunning) {
      return 'widget-cell execution-running';
    } else {
      return 'widget-cell';
    }
  }

  showOntologyInformations() {
    const dialogData: OntologyInformationsDialogData = new OntologyInformationsDialogData();
    dialogData.variableName = this.nodeData.variableName;
    dialogData.displayName = this.nodeData.displayName;
    dialogData.name = this.nodeData.identifier;
    dialogData.unit = this.nodeData.unit;
    dialogData.nodeData = this.nodeData;
    dialogData.discipline = this.discipline;
    dialogData.namespace = this.namespace;

    this.dialogRef = this.dialog.open(OntologyInformationsComponent, {
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

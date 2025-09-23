import { Component, OnInit, Input, OnDestroy, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
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
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DashboardItemFactory, ItemData, ItemLayout } from 'src/app/models/dashboard.model';
import { TreeNode } from 'src/app/models/tree-node.model';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})

export class WidgetComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  private static BASE_INTEGRITY_TOOLTIP_CLASS = 'custom-tooltip-class';

  @Input() nodeData: NodeData;
  @Input() namespace: string;
  @Input() discipline: string;
  @Input() forceReadOnly?: boolean;
  @Input() isDashboardInEdition?:boolean;
  @Input() width?: number;
  @Input() height?: number;

  public widgetType: WidgetType;
  public isCalculationRunning: boolean;
  calculationChangeSubscription: Subscription;
  dashboardEditionModeSubscription: Subscription;
  dashboardItemsRemovedSubscription: Subscription;
  private borderClassMapping: Record<ValueType, string>;
  private iconClassMapping: Record<ValueType, string>;
  private iconTooltipMapping: Record<ValueType, string>;
  public borderClass: string;
  public headerIconClass: string;
  public headerIconTooltip: string;

  private baseIntegrityTooltipClass: string;
  public integrityTooltipClass: string;

  public widgetIntegrityMessage: string;
  public integrityMessageClass: string;
  private dialogRef: MatDialogRef<OntologyInformationsComponent>;
  public isFavorite: boolean;
  public isDashboardContext: boolean = false;
  public dashboardScale: number = 1;

  constructor(
    private dialog: MatDialog,
    private calculationService: CalculationService,
    private studyCaseDataService: StudyCaseDataService,
    public ontologyService: OntologyService,
    private studyCaseLocalStorageService: StudyCaseLocalStorageService,
    public filterService: FilterService,
    private snackbarService: SnackbarService,
    public dashboardService: DashboardService) {

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

    this.iconTooltipMapping = {
      [ValueType.EMPTY]: 'Data has errors',
      [ValueType.USER]: 'Editable data',
      [ValueType.DEFAULT]: 'Default data',
      [ValueType.READ_ONLY]: 'Read-only data',
      [ValueType.OPTIONAL]: 'Optional data'
    };

    this.baseIntegrityTooltipClass = 'custom-tooltip-class';
    this.integrityTooltipClass = this.baseIntegrityTooltipClass;
    this.widgetIntegrityMessage = '';
    this.integrityMessageClass = 'error-message error-message-color-red';
    this.isDashboardInEdition = false;
  }

  ngOnInit(): void {
    const status = this.studyCaseDataService.loadedStudy.treeview.rootNode.status;
    this.isCalculationRunning = status === DisciplineStatus.STATUS_RUNNING || status === DisciplineStatus.STATUS_PENDING;
    this.widgetType = this.nodeData.widgetType;
    this.calculationChangeSubscription = this.calculationService.onCalculationChange.subscribe(calculationRunning => {
      this.isCalculationRunning = calculationRunning;
    });

    // Subscribe to dashboard edition mode changes
    this.dashboardEditionModeSubscription = this.dashboardService.onDashboardEditionModeChanged.subscribe(isInEdition => {
      this.isDashboardInEdition = isInEdition;
    });

    // Subscribe to dashboard items removed events
    this.dashboardItemsRemovedSubscription = this.dashboardService.onDashboardItemsRemoved.subscribe(removedItemId => {
      if (removedItemId === this.nodeData.identifier) {
        this.isFavorite = false;
      }
    });

    this.SetBorderClass();
    this.SetHeaderIconClass();
    this.loadFavorites();
    this.updateDashboardContext();
  }

  private updateDashboardContext(): void {
    // Detect if we're in dashboard context by checking if width/height are provided and valid
    this.isDashboardContext = !!(this.width && this.height && this.width > 0 && this.height > 0);
    
    if (this.isDashboardContext) {
      this.calculateDashboardScale();
    } else {
      this.dashboardScale = 1; // Reset to default scale when not in dashboard
    }
  }

  private calculateDashboardScale(): void {
    // Base widget sizes pour différents types (réduits pour permettre plus de scaling)
    const baseWidgets = { width: 300, height: 80 };
    
    if (this.width && this.height) {
      // Réduire encore plus le padding pour maximiser l'espace
      const usableWidth = this.width ;   // Réduit de 20 à 10
      const usableHeight = this.height ; // Réduit de 15 à 10
      
      // Get base dimensions for current widget type
      const baseSize = baseWidgets;
      
      // Calculate scale basé sur le plus petit ratio pour maintenir l'aspect ratio
      const widthScale = usableWidth / baseSize.width;
      const heightScale = usableHeight / baseSize.height;
      let scale = Math.min(widthScale, heightScale);
      
      // Si on dépasse la taille de base, on applique un bonus de scaling
    if (usableWidth > baseSize.width || usableHeight > baseSize.height) {
      // Calculer combien on dépasse en pourcentage
      const widthOverflow = Math.max(0, (usableWidth - baseSize.width) / baseSize.width);
      const heightOverflow = Math.max(0, (usableHeight - baseSize.height) / baseSize.height);
      const maxOverflow = Math.max(widthOverflow, heightOverflow);
      
      // Appliquer un bonus progressif (par exemple 50% du dépassement)
      const bonus = maxOverflow * 0.5;
      scale = scale * (1 + bonus);
    }
    
    // Limites de scaling plus généreuses
    this.dashboardScale = Math.max(Math.min(scale, 6.0), 0.8); // Max 6.0, min 0.8
  }
  }

  // force reload so the edition mode is correctly applied and stars appear and disappear correctly
  ngAfterViewInit(): void {
    if (this.isDashboardInEdition === undefined)
      this.isDashboardInEdition = this.dashboardService.isDashboardInEdition
  }

  ngOnDestroy(): void {
    if (this.dialogRef !== null && this.dialogRef !== undefined) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    
    // Unsubscribe from dashboard edition mode changes
    if (this.dashboardEditionModeSubscription) {
      this.dashboardEditionModeSubscription.unsubscribe();
    }
    
    // Unsubscribe from dashboard items removed events
    if (this.dashboardItemsRemovedSubscription) {
      this.dashboardItemsRemovedSubscription.unsubscribe();
    }
    
    // Unsubscribe from calculation changes
    if (this.calculationChangeSubscription) {
      this.calculationChangeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
      // Update dashboard context when width or height changes
      if (changes.width || changes.height) {
        this.updateDashboardContext();
      }
      
      this.isDashboardInEdition = this.dashboardService.isDashboardInEdition;
      
    }
    

  public onInputChange(value) {
    const updateItem = new StudyUpdateParameter(
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

    this.snackbarService.showInformation(`${this.nodeData.displayName} has been added to temporary changes`);
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
    this.headerIconTooltip = this.iconTooltipMapping[this.nodeData.valueType] || '';
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

  OnFavoriteClick() {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite)
      this.saveFavorites(true)
    else
      this.saveFavorites(false)
  }

  saveFavorites(isFavorite: boolean) {
    const simpleParent = TreeNode.CreateSimpleNode(this.nodeData.parent);
    //copy nodeData 
    const simpleNode = Object.assign(Object.create(Object.getPrototypeOf(this.nodeData)), this.nodeData);
    simpleNode.parent = simpleParent;
    
    const value: {
      layout: ItemLayout,
      data: ItemData
    } = DashboardItemFactory.createValueData(simpleNode, this.discipline, this.namespace);
    const text: void | string = isFavorite ? this.dashboardService.addItem(value) : this.dashboardService.removeItem(value.layout.item_id);
    this.snackbarService.showInformation(text ? text : isFavorite ? 'Value added to dashboard !' : 'Value removed from dashboard !');
  }

  loadFavorites() {
    this.isDashboardInEdition = this.dashboardService.isDashboardInEdition;
    this.isFavorite = this.dashboardService.isSelected(this.nodeData.identifier);
  }
}

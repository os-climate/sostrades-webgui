import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule, FullscreenOverlayContainer, OverlayContainer } from '@angular/cdk/overlay';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { HeaderComponent } from './modules/header/header.component';
import { SidenavComponent } from './modules/sidenav/sidenav.component';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';

import { SelectComponent } from './shared/select/select.component';
import { InputComponent } from './shared/input/input.component';
import { WidgetContainerComponent } from './shared/widget-container/widget-container.component';

import { CouplingGraphComponent } from './modules/visualisation/visualisation-coupling-graph/visualisation-coupling-graph.component';

import { ProgressBarComponent } from './shared/progress-bar/progress-bar.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { TreeNodeDataService } from './services/tree-node-data.service';
import { WidgetComponent } from './shared/widget/widget.component';
import { LabelComponent } from './shared/label/label.component';
import { SnackbarComponent } from './shared/snackbar/snackbar.component';
import { TableComponent } from './shared/table/table.component';
import { PostProcessingComponent } from './modules/post-processings/post-processing/post-processing.component';
import { OntologyService } from './services/ontology/ontology.service';
import { LoadingDialogComponent } from './modules/loading-dialog/loading-dialog.component';
import { StudyCaseExecutionLoggingComponent } from './modules/study-case/study-case-execution-logging/study-case-execution-logging.component';
import { FileSpreadsheetComponent } from './shared/file-spreadsheet/file-spreadsheet.component';
import { ValidationDialogComponent } from './shared/validation-dialog/validation-dialog.component';
import { StudyCaseTreeviewComponent } from './modules/study-case/study-case-treeview/study-case-treeview.component';
import { CustomTooltipComponent } from './shared/custom-tooltip/custom-tooltip.component';
import { StudyWorkspaceComponent } from './modules/study-case/study-case-workspace/study-workspace.component';
import { StudyCaseManagementComponent } from './modules/study-case/study-case-management/study-case-management.component';
import { GroupManagementComponent } from './modules/group-management/group-management.component';
import { StudyCaseManagementContainerComponent } from './modules/study-case/study-case-management-container/study-case-management-container.component';
import { OntologyInformationsComponent } from './modules/ontology/ontology-informations/ontology-informations.component';
import { OntologyParameterInformationsComponent } from './modules/ontology/ontology-parameter-informations/ontology-parameter-informations.component';
import { StudyCaseStatusInformationComponent } from './modules/study-case/study-case-status-information/study-case-status-information.component';
import { SelectAllOptionComponent } from './shared/select-all-option/select-all-option.component';

import { AngularSplitModule } from 'angular-split';
import { StudyCaseExecutionExceptionDialogComponent } from './modules/study-case/study-case-execution-exception-dialog/study-case-execution-exception-dialog.component';
import { UserManagementComponent } from './modules/user/user-management/user-management.component';
import { CreateUserComponent } from './modules/user/user-creation/user-creation.component';
import { UserAppLoadingComponent } from './modules/user/user-app-loading/user-app-loading.component';
import { StudyCaseExecutionManagementComponent } from './modules/study-case/study-case-execution-management/study-case-execution-management.component';

import fr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import { UserRoomDialogComponent } from './modules/user/user-room-dialog/user-room-dialog.component';
import { StudyCaseEventContainerComponent } from './modules/study-case/study-case-event-container/study-case-event-container.component';
import { StudyCaseNotificationsComponent } from './modules/study-case/study-case-notifications/study-case-notifications.component';
import { StudyCaseNotificationsChangesDialogComponent } from './modules/study-case/study-case-notifications-changes-dialog/study-case-notifications-changes-dialog.component';
import { StudyCaseExecutionDialogComponent } from './modules/study-case/study-case-execution-dialog/study-case-execution-dialog.component';
import { StudyCaseModificationDialogComponent } from './modules/study-case/study-case-modification-dialog/study-case-modification-dialog.component';
import { SamlComponent } from './modules/saml/saml.component';
import { DataManagementInformationComponent } from './modules/data-management/data-management-information/data-management-information.component';
import { PostProcessingPlotlyComponent } from './shared/post-processing/post-processing-plotly/post-processing-plotly.component';
import { MarkdownRendererDirective } from './directives/markdown-renderer/markdown-renderer.directive';
import { UpdateEntityRightComponent } from './modules/entity-right/update-entity-right/update-entity-right.component';
import { UpdateEntityRightAddPeopleComponent } from './modules/entity-right/update-entity-right-add-people/update-entity-right-add-people.component';
import { ReferenceManagementComponent } from './modules/reference-management/reference-management.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { TableVirtualScrollModule } from 'ng-table-virtual-scroll';
import { DataManagementContainerComponent } from './modules/data-management/data-management-container/data-management-container.component';
import { DataManagementDisciplineComponent } from './modules/data-management/data-management-discipline/data-management-discipline.component';
import { DocumentationComponent } from './modules/study-case/study-case-documentation/study-case-documentation.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { OntologyParameterConverterPipe } from './pipes/ontology-parameter-converter/ontology-parameter-converter.pipe';
import { OntologyDisciplineConverterPipe } from './pipes/ontology-discipline-converter/ontology-discipline-converter.pipe';
import { PostProcessingBundleComponent } from './modules/post-processings/post-processing-bundle/post-processing-bundle.component';
import { StudyCaseDirectAccessComponent } from './modules/study-case/study-case-direct-access/study-case-direct-access.component';
import { StudyCaseLinkInformationComponent } from './modules/study-case/study-case-link-information/study-case-link-information.component';
import { PostProcessingParetoFrontComponent } from './shared/post-processing-pareto-front/post-processing-pareto-front.component';
import { SearchPanelComponent } from './modules/search-panel/search-panel.component';

import { ClipboardModule } from '@angular/cdk/clipboard';
import { SlideToggleComponent } from './shared/slide-toggle/slide-toggle.component';
import { VisualisationContainerComponent } from './modules/visualisation/visualisation-container/visualisation-container.component';
import { ExecutionSequenceComponent } from './modules/visualisation/visualisation-execution-sequence/visualisation-execution-sequence.component';
import { OntologyContainerComponent } from './modules/ontology/ontology-container/ontology-container.component';
import { OntologyMainComponent } from './modules/ontology/ontology-main/ontology-main.component';
import { OntologyParametersComponent } from './modules/ontology/ontology-parameters/ontology-parameters.component';
import { OntologyProcessesComponent } from './modules/ontology/ontology-processes/ontology-processes.component';
import { OntologyModelsComponent } from './modules//ontology/ontology-models/ontology-models.component';
import { StudyCaseValidationDialogComponent } from './modules/study-case/study-case-validation-dialog/study-case-validation-dialog.component';
import { SpreadsheetComponent } from './modules/spreadsheet/spreadsheet.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { ScientificNotationPipe } from './pipes/scientific-notation/scientific-notation.pipe';
import { ConnectorDataComponent } from './modules/connector-data/connector-data.component';
import { LinkComponent } from './modules/link/link/link.component';
import { LinkCreateOrEditComponent } from './modules/link/link-create-or-edit/link-create-or-edit.component';
import { WelcomPageComponent } from './modules/welcom-page/welcom-page.component';
import { ContactDialogComponent } from './modules/contact-dialog/contact-dialog.component';
import { DisciplineIconMappingConverterPipe } from './pipes/discipline-icon-mapping-converter/discipline-icon-mapping-converter.pipe';
import { StudyCaseLoggingComponent } from './modules/study-case/study-case-logging/study-case-logging.component';
import { RepositoryTraceabilityDialogComponent } from './modules/ontology/ontology-main/repository-traceability-dialog/repository-traceability-dialog.component';
import { FilterDialogComponent } from './shared/filter-dialog/filter-dialog.component';
import { NewsComponent } from './modules/news/news/news.component';
import { NewsCreateOrEditComponent } from './modules/news/news-create-or-edit/news-create-or-edit.component';
import { VisualisationInterfaceDiagramComponent } from './modules/visualisation/visualisation-interface-diagram/visualisation-interface-diagram.component';
import { OntologyModelsInformationComponent } from './modules/ontology/ontology-models/ontology-models-information/ontology-models-information.component';
import { OntologyProcessInformationComponent } from './modules/ontology/ontology-processes/ontology-process-information/ontology-process-information.component';
import { StudyCaseCreationComponent } from './modules/study-case/study-case-creation/study-case-creation.component';
import { PodSettingsComponent } from './shared/pod-settings/pod-settings.component';
import { ProcessBuilderComponent } from './shared/process-builder/process-builder.component';
import { NoServerComponent } from './modules/no-server/no-server.component';
import { LoginInformationDialogComponent } from './modules/login/login-information-dialog/login-information-dialog.component';
import { EditionFormDialogComponent } from './shared/edition-form-dialog/edition-form-dialog.component';

registerLocaleData(fr);


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SidenavComponent,
        HomeComponent,
        LoginComponent,
        SelectComponent,
        InputComponent,
        WidgetContainerComponent,
        CouplingGraphComponent,
        ProgressBarComponent,
        WidgetComponent,
        LabelComponent,
        SnackbarComponent,
        TableComponent,
        PostProcessingComponent,
        LoadingDialogComponent,
        StudyCaseExecutionLoggingComponent,
        FileSpreadsheetComponent,
        ValidationDialogComponent,
        StudyCaseTreeviewComponent,
        CustomTooltipComponent,
        StudyWorkspaceComponent,
        StudyCaseManagementComponent,
        GroupManagementComponent,
        StudyCaseManagementContainerComponent,
        OntologyInformationsComponent,
        OntologyParameterInformationsComponent,
        StudyCaseStatusInformationComponent,
        SelectAllOptionComponent,
        StudyCaseExecutionExceptionDialogComponent,
        UserManagementComponent,
        CreateUserComponent,
        UserAppLoadingComponent,
        StudyCaseExecutionManagementComponent,
        UserRoomDialogComponent,
        StudyCaseEventContainerComponent,
        StudyCaseNotificationsComponent,
        StudyCaseNotificationsChangesDialogComponent,
        StudyCaseExecutionDialogComponent,
        StudyCaseModificationDialogComponent,
        SamlComponent,
        DataManagementInformationComponent,
        PostProcessingPlotlyComponent,
        MarkdownRendererDirective,
        UpdateEntityRightComponent,
        UpdateEntityRightAddPeopleComponent,
        ReferenceManagementComponent,
        DataManagementContainerComponent,
        DataManagementDisciplineComponent,
        SearchPanelComponent,
        DocumentationComponent,
        DashboardComponent,
        OntologyParameterConverterPipe,
        OntologyDisciplineConverterPipe,
        PostProcessingBundleComponent,
        StudyCaseDirectAccessComponent,
        StudyCaseLinkInformationComponent,
        SlideToggleComponent,
        PostProcessingParetoFrontComponent,
        VisualisationContainerComponent,
        ExecutionSequenceComponent,
        OntologyContainerComponent,
        OntologyMainComponent,
        OntologyParametersComponent,
        OntologyProcessesComponent,
        OntologyModelsComponent,
        StudyCaseValidationDialogComponent,
        SpreadsheetComponent,
        ResetPasswordComponent,
        ScientificNotationPipe,
        ConnectorDataComponent,
        LinkComponent,
        LinkCreateOrEditComponent,
        WelcomPageComponent,
        ContactDialogComponent,
        DisciplineIconMappingConverterPipe,
        StudyCaseLoggingComponent,
        RepositoryTraceabilityDialogComponent,
        FilterDialogComponent,
        NewsComponent,
        NewsCreateOrEditComponent,
        VisualisationInterfaceDiagramComponent,
        OntologyModelsInformationComponent,
        OntologyProcessInformationComponent,
        StudyCaseCreationComponent,
        PodSettingsComponent,
        ProcessBuilderComponent,
        NoServerComponent,
        LoginInformationDialogComponent,
        EditionFormDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        DragDropModule,
        OverlayModule,
        ScrollingModule,
        TableVirtualScrollModule,
        ClipboardModule,
        AngularSplitModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
        TreeNodeDataService,
        OntologyService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent]
})
export class AppModule { }

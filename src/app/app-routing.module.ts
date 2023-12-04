import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './modules/login/login.component';
import { StudyWorkspaceComponent } from './modules/study-case/study-case-workspace/study-workspace.component';
import { StudyCaseManagementContainerComponent } from './modules/study-case/study-case-management-container/study-case-management-container.component';
import { UserManagementComponent } from './modules/user/user-management/user-management.component';
import { StudyGuard } from './services/study.guard';
import { StudyManagerGuard } from './services/study-manager.guard';
import { NoAccessGuard } from './services/no-access.guard';
import { StudyCaseExecutionManagementComponent } from './modules/study-case/study-case-execution-management/study-case-execution-management.component';
import { SamlComponent } from './modules/saml/saml.component';
import { StudyCaseDirectAccessComponent } from './modules/study-case/study-case-direct-access/study-case-direct-access.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { WelcomPageComponent } from './modules/welcom-page/welcom-page.component';
import { GroupManagementComponent } from './modules/group-management/group-management.component';
import { ReferenceManagementComponent } from './modules/reference-management/reference-management.component';
import { StudyCaseManagementComponent } from './modules/study-case/study-case-management/study-case-management.component';
import { Routing } from './models/routing.model';
import { OntologyParametersComponent } from './modules/ontology/ontology-parameters/ontology-parameters.component';
import { OntologyProcessesComponent } from './modules/ontology/ontology-processes/ontology-processes.component';
import { OntologyMainComponent } from './modules/ontology/ontology-main/ontology-main.component';
import { OntologyContainerComponent } from './modules/ontology/ontology-container/ontology-container.component';
import { OntologyModelsComponent } from './modules/ontology/ontology-models/ontology-models.component';
import { NoServerComponent } from './modules/no-server/no-server.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: WelcomPageComponent,
        canActivate: [StudyGuard]
      },

      {
        path: Routing.HOME,
        component: WelcomPageComponent,
        canActivate: [StudyGuard]
      },
      {
        path: Routing.STUDY_CASE,
        component: StudyCaseManagementContainerComponent,
        canActivate: [StudyGuard],
        children: [
          {
            path: '',
            component: StudyCaseManagementComponent,
            canActivate: [StudyGuard]
          },
          {
            path: Routing.STUDY_MANAGEMENT,
            component: StudyCaseManagementComponent,
            canActivate: [StudyGuard],
          },
          {
            path: Routing.REFERENCE_MANAGEMENT,
            component: ReferenceManagementComponent,
            canActivate: [StudyGuard],
          }
        ]
      },
      {
        path: Routing.STUDY_WORKSPACE,
        component: StudyWorkspaceComponent,
        canActivate: [StudyGuard]
      },
      {
        path: Routing.STUDY_ID,
        component: StudyCaseDirectAccessComponent,
        canActivate: [AuthGuard, StudyGuard]
      },
      {
        path: Routing.ONTOLOGY,
        component: OntologyContainerComponent,
        canActivate: [StudyGuard],
        children: [
          {
            path: '',
            component: OntologyContainerComponent,
            canActivate: [StudyGuard]
          },
          {
            path: Routing.ONTOLOGY_MAIN,
            component: OntologyMainComponent,
            canActivate: [StudyGuard]
          },
          {
            path: Routing.MODELS,
            component: OntologyModelsComponent,
            canActivate: [StudyGuard],
          },
          {
            path: Routing.PROCESSES,
            component: OntologyProcessesComponent,
            canActivate: [StudyGuard],
          },
          {
            path: Routing.ONTOLOGY_PARAMETERS,
            component: OntologyParametersComponent,
            canActivate: [StudyGuard],
          },
        ]
      },
      {
        path: Routing.GROUP_MANAGEMENT,
        component: GroupManagementComponent,
        canActivate: [StudyGuard]
      },
      {
        path: Routing.USER_MANAGEMENT,
        component: UserManagementComponent,
        canActivate: [StudyManagerGuard]
      },
      {
        path: Routing.EXECUTION_MANAGEMENT,
        component: StudyCaseExecutionManagementComponent,
        canActivate: [StudyManagerGuard]
      },
      {
        path: Routing.PROCESSES_MANAGEMENT,
        component: OntologyProcessesComponent,
        canActivate: [StudyManagerGuard]
      },
    ]
  },
  {
    path: Routing.LOGIN,
    component: LoginComponent
  },
  {
    path: Routing.LOGOUT,
    component: LoginComponent
  },
  {
    path: Routing.SAML,
    component: SamlComponent
  },
  {
    path: Routing.RESET_PASSWORD,
    component: ResetPasswordComponent
  },
  {
    path: Routing.NO_SERVER,
    component: NoServerComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

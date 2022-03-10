import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './modules/login/login.component';
import { StudyWorkspaceComponent } from './modules/study-case/study-case-workspace/study-workspace.component';
import { StudyCaseManagementContainerComponent } from './modules/study-case/study-case-management-container/study-case-management-container.component';
import { ModelsContainerComponent } from './modules/models/models-container/models-container.component';
import { UserManagementComponent } from './modules/user/user-management/user-management.component';
import { StudyGuard } from './services/study.guard';
import { AdminGuard } from './services/admin.guard';
import { CurrentUserNoRightsComponent } from './modules/user/user-no-rights/user-no-rights.component';
import { NoAccessGuard } from './services/no-access.guard';
import { StudyCaseExecutionManagementComponent } from './modules/study-case/study-case-execution-management/study-case-execution-management.component';
import { SamlComponent } from './modules/saml/saml.component';
import { ProcessManagementComponent } from './modules/process/process-management/process-management.component';
import { StudyCaseDirectAccessComponent } from './modules/study-case/study-case-direct-access/study-case-direct-access.component';
import { ResetPasswordComponent } from './modules/reset-password/reset-password.component';
import { WelcomPageComponent } from './modules/welcom-page/welcom-page.component';
import { GroupManagementComponent } from './modules/group-management/group-management.component';
import { ReferenceManagementComponent } from './modules/reference-management/reference-management.component';
import { StudyCaseManagementComponent } from './modules/study-case/study-case-management/study-case-management.component';
import { ModelsLinksComponent } from './modules/models/models-links/models-links.component';
import { ModelsStatusTableComponent } from './modules/models/models-status-table/models-status-table.component';
import { Routing } from './models/routing';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: '',
        component: StudyCaseManagementContainerComponent,
        canActivate: [StudyGuard]
      },
     
      {
        path: Routing.STUDY_MANAGEMENT,
        component: StudyCaseManagementContainerComponent,
        canActivate: [StudyGuard],
        children: [
          {
            path: '',
            component: StudyCaseManagementComponent,
            canActivate: [StudyGuard]
          },
          {
            path: Routing.STUDY_CASE,
            component: StudyCaseManagementComponent,
            canActivate: [StudyGuard],
          },
          {
            path: Routing.FROM_PROCESS,
            component: ProcessManagementComponent,
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
        path: Routing.MODELS_STATUS,
        component: ModelsContainerComponent,
        canActivate: [StudyGuard],
        children: [
          {
            path: '',
            component: ModelsContainerComponent,
            canActivate: [StudyGuard]
          },
          {
            path: Routing.MODELS_STATUS,
            component: ModelsStatusTableComponent,
            canActivate: [StudyGuard],
          },
          {
            path: Routing.MODELS_LINKS,
            component: ModelsLinksComponent,
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
        canActivate: [AdminGuard]
      },
      {
        path: Routing.EXECUTION_MANAGEMENT,
        component: StudyCaseExecutionManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: Routing.PROCESSES_MANAGEMENT,
        component: ProcessManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: Routing.NO_ACCESS,
        component: CurrentUserNoRightsComponent,
        canActivate: [NoAccessGuard]
      }
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
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

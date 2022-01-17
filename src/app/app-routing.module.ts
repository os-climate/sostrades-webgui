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
        path: 'study-management',
        component: StudyCaseManagementContainerComponent,
        canActivate: [StudyGuard]
      },
      {
        path: 'study-workspace',
        component: StudyWorkspaceComponent,
        canActivate: [StudyGuard]
      },
      {
        path: 'study/:id',
        component: StudyCaseDirectAccessComponent,
        canActivate: [AuthGuard, StudyGuard]
      },
      {
        path: 'models-status',
        component: ModelsContainerComponent,
        canActivate: [StudyGuard]
      },
      {
        path: 'user-management',
        component: UserManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'execution-management',
        component: StudyCaseExecutionManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'processes-management',
        component: ProcessManagementComponent,
        canActivate: [AdminGuard]
      },
      {
        path: 'no-access',
        component: CurrentUserNoRightsComponent,
        canActivate: [NoAccessGuard]
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'logout',
    component: LoginComponent
  },
  {
    path: 'saml',
    component: SamlComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

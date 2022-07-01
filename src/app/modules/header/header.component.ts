import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { UserService } from 'src/app/services/user/user.service';
import { NavigationTitle } from 'src/app/models/navigation-title.model';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { Routing } from 'src/app/models/routing.model';
import { ContactDialogService } from 'src/app/services/contact-dialog/contact-dialog.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { MatMenuTrigger } from '@angular/material/menu';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {


  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  public username: string;
  public versionDate: string;
  public platform: string;
  public title: string;
  public hasAccessToStudyManager: boolean;
  public hasAccessToStudy: boolean;
  constructor(
    private router: Router,
    private auth: AuthService,
    private headerService: HeaderService,
    public contactDialogService: ContactDialogService,
    public studyCaseDataService: StudyCaseDataService,
    public dialog: MatDialog,
    private userService: UserService,
    private appDataService: AppDataService,
    public filterService: FilterService) {

    this.versionDate = '';
    this.platform = '';
    this.title = '';
    this.hasAccessToStudyManager = false;
    this.hasAccessToStudy = false;
  }

  ngOnInit(): void {

    this.username = this.userService.getFullUsernameWithNameInCapitalize();
    this.hasAccessToStudyManager = this.userService.hasAccessToStudyManager();
    this.hasAccessToStudy = this.userService.hasAccessToStudy();

    this.appDataService.getAppInfo().subscribe(res => {
      if (res !== null && res !== undefined) {
        this.versionDate = res['version'];
        this.platform = res['platform'];
      }
    });

    this.headerService.onChangeTitle.subscribe(result => {
      this.title = result;
    });

    if (this.router.url.includes(Routing.HOME)) {
      this.title = NavigationTitle.HOME;
    } else if (this.router.url.includes(Routing.STUDY_MANAGEMENT)) {
      this.title =  NavigationTitle.STUDY_MANAGEMENT;
    } else if (this.router.url.includes(Routing.ONTOLOGY)) {
      this.title = NavigationTitle.MODELS_STATUS;
    } else if (this.router.url.includes(Routing.PROCESSES)) {
      this.title = NavigationTitle.PROCESS;
      this.headerService.changeIndexTab(1);
    } else if (this.router.url.includes(Routing.STUDY_WORKSPACE)) {
      this.title = NavigationTitle.STUDY_WORKSPACE;
    } else if (this.router.url.includes(Routing.GROUP_MANAGEMENT)) {
      this.title = NavigationTitle.GROUP_MANAGEMENT;
    } else if (this.router.url.includes(Routing.USER_MANAGEMENT)) {
      this.title = NavigationTitle.USER_MANAGEMENT;
    } else if (this.router.url.includes(Routing.PROCESSES_MANAGEMENT)) {
      this.title = NavigationTitle.PROCESSES_MANAGEMENT;
    } else if (this.router.url.includes(Routing.EXECUTION_MANAGEMENT)) {
      this.title = NavigationTitle.EXECUTION_MANAGEMENT;
    } else {
      this.title = NavigationTitle.HOME;
    }
  }


  // Welcome page
  onClickWelcomePage() {
    this.router.navigate([Routing.HOME]);
    this.title = NavigationTitle.HOME;
  }

  // Study Management
  onClickStudyManagement() {
    this.router.navigate([Routing.STUDY_MANAGEMENT]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(0);
  }

  onClickStudyCase() {
    this.router.navigate([Routing.STUDY_MANAGEMENT, Routing.STUDY_CASE]);
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(0);

  }

  onClickReferenceManagement() {
    this.router.navigate([Routing.STUDY_MANAGEMENT, Routing.REFERENCE_MANAGEMENT]);
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(2);
  }

  // Ontology
  onClickOntology() {
    this.router.navigate([Routing.ONTOLOGY]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.MODELS_STATUS;
    this.headerService.changeIndexTab(0);

  }

   // Model Status
   onClickModelsStatus() {
    this.router.navigate([Routing.ONTOLOGY, Routing.MODELS_STATUS]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.MODELS_STATUS;
    this.headerService.changeIndexTab(0);

  }
    // Ontology processes
  onClickOntologyProcesses() {
    this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES]);
    this.title = NavigationTitle.PROCESS;
    this.headerService.changeIndexTab(1);
  }

    // Ontology parameters
    onClickOntologyParameters() {
      this.router.navigate([Routing.ONTOLOGY, Routing.ONTOLOGY_PARAMETERS]);
      this.title = NavigationTitle.ONTOLOGY_PARAMETERS;
      this.headerService.changeIndexTab(2);
    }

  // Group Management
  onClickGroupManagement() {
    this.router.navigate([Routing.GROUP_MANAGEMENT]);
    this.title = NavigationTitle.GROUP_MANAGEMENT;
  }

  // User Management
  onClickUserManagement() {
    this.router.navigate([Routing.USER_MANAGEMENT]);
    this.title = NavigationTitle.USER_MANAGEMENT;
  }
  // Process Management
  onClickProcessesManagement() {
    this.router.navigate([Routing.PROCESSES_MANAGEMENT]);
    this.title = NavigationTitle.PROCESSES_MANAGEMENT;
  }


  // Execution Management
  onClickExecutionManagement() {
    this.router.navigate([Routing.EXECUTION_MANAGEMENT]);
    this.title = NavigationTitle.EXECUTION_MANAGEMENT;
  }

  // Contact
  onClickOnContact() {
  this.contactDialogService.openContactDialog();
  }

  logout() {
    this.auth.deauthenticate().subscribe();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { UserService } from 'src/app/services/user/user.service';
import { HeaderService } from 'src/app/services/hearder/header.service';
import { NavigationTitle, Routing } from 'src/app/models/enumeration.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyCaseMainService } from 'src/app/services/study-case/main/study-case-main.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { environment } from 'src/environments/environment';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { StudyCaseAllocation, StudyCaseAllocationStatus } from 'src/app/models/study-case-allocation.model';


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
  environment = environment;
  public hasAccessToStudyManager: boolean;
  public hasAccessToStudy: boolean;
  public onNoServerSubscription: Subscription;
  private onNoStudyServerSubscription: Subscription;
  private onCloseStudySubscription: Subscription;
  public displayMessageNoServer: boolean;
  public displayMessageNoStudyServer: boolean;
  public displayOOMKilledMessage: boolean;
  public OOMKilledMessage: string;
  constructor(
    private router: Router,
    private auth: AuthService,
    private headerService: HeaderService,
    public studyCaseDataService: StudyCaseDataService,
    public studyCaseMainService: StudyCaseMainService,
    private socketService: SocketService,
    public dialog: MatDialog,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private appDataService: AppDataService,
    public filterService: FilterService) {

    this.versionDate = '';
    this.platform = '';
    this.title = '';
    this.hasAccessToStudyManager = false;
    this.hasAccessToStudy = false;
    this.onNoServerSubscription = null;
    this.onNoStudyServerSubscription = null;
    this.displayMessageNoServer = false;
    this.displayMessageNoStudyServer = false;
    this.displayOOMKilledMessage = false;
    this.OOMKilledMessage = "";
  }

  ngOnInit(): void {

    this.username = this.userService.getFullUsernameWithNameInCapitalize();
    this.hasAccessToStudyManager = this.userService.hasAccessToStudyManager();
    this.hasAccessToStudy = this.userService.hasAccessToStudy();

    this.onStudyServerSubscribe();

    this.onNoServerSubscription = this.appDataService.onNoServerResponse.subscribe(response => {
      if (response) {
        this.displayMessageNoServer = true;
      }
      else {
        this.displayMessageNoServer = false;
      }
    });

    if (this.appDataService.platformInfo !== null && this.appDataService.platformInfo !== undefined) {
      this.versionDate = this.appDataService.platformInfo.version;
      this.platform = this.appDataService.platformInfo.platform;
    } else {
        this.appDataService.getAppInfo().subscribe(platformInfo => {
          if (platformInfo !== null && platformInfo !== undefined) {
            this.versionDate = platformInfo.version;
            this.platform = platformInfo.platform;
          }
        });
    }
    

    this.headerService.onChangeTitle.subscribe(result => {
      this.title = result;
    });
    switch (this.router.url !== '') {
      case this.router.url.includes(Routing.HOME):
        this.title = NavigationTitle.HOME;
        break;
      case this.router.url.includes(Routing.STUDY_MANAGEMENT):
        this.title = NavigationTitle.STUDY_MANAGEMENT;
        break;
      case this.router.url.includes(Routing.ONTOLOGY_MAIN):
        this.title = NavigationTitle.ONTOLOGY_MAIN;
        break;
      case this.router.url.includes(Routing.MODELS):
        this.title = NavigationTitle.MODELS;
        break;
      case this.router.url.includes(Routing.PROCESSES):
        this.title = NavigationTitle.PROCESS;
        break;
      case this.router.url.includes(Routing.ONTOLOGY_PARAMETERS):
        this.title = NavigationTitle.ONTOLOGY_PARAMETERS;
        break;
      case this.router.url.includes(Routing.STUDY_WORKSPACE):
        this.title = NavigationTitle.STUDY_WORKSPACE;
        break;
      case this.router.url.includes(Routing.GROUP_MANAGEMENT):
        this.title = NavigationTitle.GROUP_MANAGEMENT;
        break;
      case this.router.url.includes(Routing.USER_MANAGEMENT):
        this.title = NavigationTitle.USER_MANAGEMENT;
        break;
      case this.router.url.includes(Routing.PROCESSES_MANAGEMENT):
        this.title = NavigationTitle.PROCESSES_MANAGEMENT;
        break;
      case this.router.url.includes(Routing.EXECUTION_MANAGEMENT):
        this.title = NavigationTitle.EXECUTION_MANAGEMENT;
        break;
      default:
        this.title = NavigationTitle.HOME;
        break;
    }
  }

  onStudyServerSubscribe(){
    this.onNoStudyServerSubscription = this.studyCaseMainService.onNoStudyServer.subscribe(isLoaded => {
      if(this.studyCaseDataService.loadedStudy !== null || this.studyCaseDataService.loadedStudy !== undefined){
        if (!isLoaded){
          // check pod error or oomkilled
          const study_id = this.studyCaseDataService.loadedStudy.studyCase.id;
          this.studyCaseDataService.getStudyCaseAllocationStatus(study_id).subscribe({
            next: allocation => {
              if(this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined){
                this.displayOOMKilledMessage = allocation.status == StudyCaseAllocationStatus.OOMKILLED;
                this.OOMKilledMessage = StudyCaseAllocation.OOMKILLEDLABEL;
                this.displayMessageNoStudyServer = !isLoaded;
              }
              else{
                this.displayMessageNoStudyServer = false;
              }
            },
            error:(error)=>{this.displayMessageNoStudyServer = false;}});
        }  
        else{
          this.displayMessageNoStudyServer = !isLoaded;
        }
      }
      else{
        this.displayMessageNoStudyServer = false;
        this.displayOOMKilledMessage = false;
      }
      
        
    });
    //if the study is closed, the header should not be visible
    this.onCloseStudySubscription = this.studyCaseMainService.onCloseStudy.subscribe(closed=>{
      if(this.displayMessageNoStudyServer){
        this.displayMessageNoStudyServer = false;
      }
      if(this.displayOOMKilledMessage){
        this.displayOOMKilledMessage = false;
      }
    })
  }

  reloadStudy()
  {
    let isInEditionMode = !this.studyCaseDataService.loadedStudy.readOnly;
    if (isInEditionMode){
      this.appDataService.loadStudyInEditionMode();
    }
    else{
      this.appDataService.loadCompleteStudy(
        this.studyCaseDataService.loadedStudy.studyCase.id, 
        this.studyCaseDataService.loadedStudy.studyCase.name, 
        (isStudyLoaded) => {
          if (isStudyLoaded) {
            // Joining room
            this.socketService.joinRoom(
              this.studyCaseDataService.loadedStudy.studyCase.id
            );
          }
      });
    }

  }

  ngOnDestroy() {
    if (this.onNoServerSubscription !== null) {
      this.onNoServerSubscription.unsubscribe();
      this.onNoServerSubscription = null;
    }
    if (this.onNoStudyServerSubscription !== null) {
      this.onNoStudyServerSubscription.unsubscribe();
      this.onNoStudyServerSubscription = null;
    }
    if (this.onCloseStudySubscription !== null) {
      this.onCloseStudySubscription.unsubscribe();
      this.onCloseStudySubscription = null;
    }
  }


  // Welcome page
  onClickWelcomePage() {
    this.router.navigate([Routing.HOME]);
    this.title = NavigationTitle.HOME;
  }

  // Study Management
  onClickStudyManagement() {
    this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(0);
  }

  onClickStudyCase() {
    this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(0);

  }

  onClickReferenceManagement() {
    this.router.navigate([Routing.STUDY_CASE, Routing.REFERENCE_MANAGEMENT]);
    this.title = NavigationTitle.STUDY_MANAGEMENT;
    this.headerService.changeIndexTab(2);
  }

  // Ontology
  onClickOntology() {
    this.router.navigate([Routing.ONTOLOGY, Routing.ONTOLOGY_MAIN]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.ONTOLOGY_MAIN;
    this.headerService.changeIndexTab(0);

  }

   // Model Status
   onClickModelsStatus() {
    this.router.navigate([Routing.ONTOLOGY, Routing.MODELS]);
    this.trigger.closeMenu();
    this.title = NavigationTitle.MODELS;
    this.headerService.changeIndexTab(1);

  }
    // Ontology processes
  onClickOntologyProcesses() {
    this.router.navigate([Routing.ONTOLOGY, Routing.PROCESSES]);
    this.title = NavigationTitle.PROCESS;
    this.headerService.changeIndexTab(2);
  }

    // Ontology parameters
    onClickOntologyParameters() {
      this.router.navigate([Routing.ONTOLOGY, Routing.ONTOLOGY_PARAMETERS]);
      this.title = NavigationTitle.ONTOLOGY_PARAMETERS;
      this.headerService.changeIndexTab(3);
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
    this.dialog.open(ContactDialogComponent);
  }

  logout() {
    this.auth.deauthenticate().subscribe({
      next: () => {
        this.router.navigate([Routing.LOGIN]);
      },
      error: (error) => {
        if (error.statusCode == 502 || error.statusCode == 0) {
          this.snackbarService.showError('No response from server');
        } else {
          this.snackbarService.showError('Error at logout : ' + error.statusText);
        }
      }
    });
  }
}

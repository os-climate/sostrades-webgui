import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Routing } from 'src/app/models/enumeration.model';
import { AppDataService } from 'src/app/services/app-data/app-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { SocketService } from 'src/app/services/socket/socket.service';
import { StudyCaseDataService } from 'src/app/services/study-case/data/study-case-data.service';
import { TypeCheckingTools } from 'src/app/tools/type-checking.tool';

@Component({
  selector: 'app-study-case-direct-access',
  templateUrl: './study-case-direct-access.component.html',
  styleUrls: ['./study-case-direct-access.component.scss']
})
export class StudyCaseDirectAccessComponent implements OnInit, OnDestroy {

  private routeSubSubscription: Subscription;

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private appDataService: AppDataService,
    private socketService: SocketService,
    private router: Router,
    private snackbarService: SnackbarService,
    private route: ActivatedRoute) {
    this.routeSubSubscription = null;
  }

  ngOnInit(): void {
    this.routeSubSubscription = this.route.params.subscribe(params => {

      const idRequested = params['id'];
      if (idRequested !== null && idRequested !== undefined && TypeCheckingTools.isInt(idRequested)) {
        this.appDataService.loadCompleteStudy(idRequested, 'requested', (isStudyLoaded) => {
          if (isStudyLoaded) {
            // Joining room
            this.socketService.joinRoom(
              this.studyCaseDataService.loadedStudy.studyCase.id
            );
          }
          else{
            this.router.navigate([Routing.STUDY_CASE, Routing.STUDY_MANAGEMENT]);
          }
        })
      } else {
        this.router.navigate(['/']);
        this.snackbarService.showError('Error loading requested study case, invalid study case parameter')
      }
    });
  }

  ngOnDestroy() {
    if ((this.routeSubSubscription !== null) && (this.routeSubSubscription !== undefined)) {
      this.routeSubSubscription.unsubscribe();
    }
  }

}

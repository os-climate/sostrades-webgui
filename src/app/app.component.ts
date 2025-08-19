import { Component, OnInit } from '@angular/core';
import { StudyCaseDataService } from './services/study-case/data/study-case-data.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket/socket.service';
import { AuthGuard } from './services/auth.guard';
import { GroupDataService } from './services/group/group-data.service';
import { UserService } from './services/user/user.service';
import { AppDataService } from './services/app-data/app-data.service';
import { Location } from '@angular/common';
import { RoutingState } from './services/routing-state/routing-state.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sos-trades-gui';

  constructor(
    private studyCaseDataService: StudyCaseDataService,
    private location: Location,
    private groupDataService: GroupDataService,
    private userService: UserService,
    private authService: AuthService,
    public authGuard: AuthGuard,
    private routingState: RoutingState,
    private appDataService: AppDataService,
    private socketService: SocketService) {
  }

  ngOnInit() {

    this.routingState.loadRouting(this.location.path());

    this.authService.subscribe(isAuth => {
      if (isAuth) {

        this.socketService.openConnection('');

        this.groupDataService.getUserGroups(true).subscribe();

        this.appDataService.startConnectionStatusTimer();

      } else {
        this.socketService.closeConnection();
        this.appDataService.stopConnectionStatusTimer();
      }
    });
  }
}

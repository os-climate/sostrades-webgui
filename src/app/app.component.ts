import { Component, OnInit, HostListener } from '@angular/core';
import { StudyCaseDataService } from './services/study-case/data/study-case-data.service';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket/socket.service';
import { combineLatest } from 'rxjs';
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
        const calls = [];

        calls.push(this.groupDataService.loadAllGroups());
        calls.push(this.userService.loadAllUsers());

        combineLatest(calls).subscribe();

        this.appDataService.startConnectionStatusTimer();

      } else {
        this.socketService.closeConnection();
        this.appDataService.stopConnectionStatusTimer();
      }
    });
  }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadHandler(event) {
  //   if (this.studyCaseDataService.loadedStudy !== null && this.studyCaseDataService.loadedStudy !== undefined) {
  //     this.socketService.leaveRoom(this.studyCaseDataService.loadedStudy.studyCase.id);
  //     this.studyCaseDataService.loadedStudy = null;
  //   }
  //   this.socketService.closeConnection();
  //   this.appDataService.stopConnectionStatusTimer();
  // }

  // @HostListener('mousemove', ['$event'])
  // onMousemove(event: MouseEvent) {
  //   let cat = document.getElementById('cat');
  //   let left = event.pageX;
  //   let top = event.pageY;

  //   if ((cat !== undefined) &&( cat !== null)) {
  //     //cat.style.left = left + 'px';
  //     //cat.style.top = top + 'px';
  //     console.log('cat', left, top);

  //     if (left <= cat.offsetLeft) {
  //       cat.style.transform= "translate(-25%, -25%) scaleX(0.25) scaleY(0.25)";
  //     } else {
  //       cat.style.transform= "translate(-25%, -25%) scaleX(-0.25) scaleY(0.25)";
  //     }

  //     cat.animate({
  //       left: left + 'px',
  //       top: top + 'px'
  //     }, 2000);
  //   } else {
  //     console.log(left, top);
  //   }
  // }
}

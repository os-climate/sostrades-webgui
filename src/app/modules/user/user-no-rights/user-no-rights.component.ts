import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-user-no-rights',
  templateUrl: './user-no-rights.component.html',
  styleUrls: ['./user-no-rights.component.scss']
})
export class CurrentUserNoRightsComponent implements OnInit {

  public mailLink: string;

  constructor(public userService: UserService) {
  }

  ngOnInit(): void {
    const gmailLink = 'https://mail.google.com/mail?view=cm&tf=0';
    const emailTo = 'sos.trades@airbus.com';
    const emailSubject = 'SoS Trades User Authorization Request';
    this.mailLink = gmailLink + (emailTo ? ('&to=' + emailTo) : '') + (emailSubject ? ('&su=' + emailSubject) : '');
  }

}

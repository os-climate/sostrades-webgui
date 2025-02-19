import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { Routing } from 'src/app/models/enumeration.model';
import { AuthService } from 'src/app/services/auth.service';
import { LoggerService } from 'src/app/services/logger/logger.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
  selector: 'app-saml',
  templateUrl: './saml.component.html',
  styleUrls: ['./saml.component.scss']
})
export class SamlComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private loggerService: LoggerService,
              private snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if ('token' in params) {
        this.loggerService.log(params);
        this.loggerService.log(decodeURIComponent(params.token));
        const tokens = params.token.split('###');

        this.authService.saml(tokens[0], tokens[1]).subscribe({
          next: () => {
            this.router.navigate(['']);
          },
          error: (error) => {
            this.loggerService.log(error);
            this.snackbarService.showError(error.description);
            if (!error.redirect) {
              this.router.navigate([Routing.LOGIN]);
            }
          }
        });
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LinkDialogData, ValidationDialogData } from 'src/app/models/dialog-data.model';
import { Link } from 'src/app/models/link.model';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { LinkService } from 'src/app/services/link/link.service';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user/user.service';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { LinkCreateOrEditComponent } from '../link-create-or-edit/link-create-or-edit.component';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

  public links: Link[];
  public isLoading: Boolean;
  public hasAccessToStudyManager: boolean;

  constructor(private dialog: MatDialog,
              private linkService: LinkService,
              private snackbarService: SnackbarService,
              private loadingDialogService: LoadingDialogService,
              private userService: UserService) {
    this.links = [];
    this.hasAccessToStudyManager = false;
  }

  ngOnInit(): void {

    this.hasAccessToStudyManager = this.userService.hasAccessToStudyManager();

    this.linkService.loadAllLinks().subscribe(links => {
      this.links = links;
    }, errorReceived => {
      const error = errorReceived as SoSTradesError;
      if (error.redirect) {
        this.snackbarService.showError(error.description);
      } else {
        this.links = [];
        this.snackbarService.showError('Error loading links : ' + error.description);
      }
    });
  }

  onOpen(event:any, link: Link) {
    window.open(link.url, "_blank");
  }

  onEdit(event:any, link: Link) {
    const dialogData: LinkDialogData = new LinkDialogData();
    dialogData.label = link.label;
    dialogData.url = link.url;
    dialogData.description = link.description;

    const dialogRef = this.dialog.open(LinkCreateOrEditComponent, {
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const linkData: LinkDialogData = result as LinkDialogData;
      if ((linkData !== null) && (linkData !== undefined)) {
        if (linkData.cancel === false) {
          this.loadingDialogService.showLoading(`Update link (${linkData.label}). Please wait.`);
          this.linkService.updateLink(link.id, linkData.url, linkData.label, linkData.description).subscribe(res => {
            console.log(res);
            link.initFromLink(res);
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation(`Link (${linkData.label}) has been succesfully updated`);
          },
          errorReceived => {
            const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(error.description);
              } else {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError('Error updating link: ' + error.description);
              }
          });
        }
      }
    });
  }

  onDelete(event:any, link: Link) {

    const validationDialogData = new ValidationDialogData();
    validationDialogData.title = 'Confirm deletion'
    validationDialogData.message = `You are about to delete the link '${link.label}'.\nThis action cannot be reverted, are you sure you want to proceed ?`;
    validationDialogData.buttonOkText = 'Delete';

    const dialogRefValidate = this.dialog.open(ValidationDialogComponent, {
      disableClose: true,
      width: '500px',
      height: '220px',
      data: validationDialogData,
    });

    dialogRefValidate.afterClosed().subscribe((result) => {
      const validationData: ValidationDialogData = result as ValidationDialogData;

      if (validationData !== null && validationData !== undefined) {
        if (validationData.cancel !== true) {
          if (validationData.validate === true) {
            this.loadingDialogService.showLoading(`Delete link (${link.label}). Please wait.`);
            this.linkService.deleteLink(link).subscribe(_ => {

              const linkIndex = this.links.findIndex((currentLink) => currentLink.id == link.id);

              if ((linkIndex >= 0) && (linkIndex < this.links.length)) {
                this.links.splice(linkIndex, 1);
              }

              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`Link (${link.label}) has been succesfully deleted`)
            },
            errorReceived => {
              const error = errorReceived as SoSTradesError;
                if (error.redirect) {
                  this.loadingDialogService.closeLoading();
                  this.snackbarService.showError(error.description);
                } else {
                  this.loadingDialogService.closeLoading();
                  this.snackbarService.showError('Error deleting link: ' + error.description);
                }
            });
          }
        }
      }
    });
  }

  onCreate(event:any) {
    const dialogData: LinkDialogData = new LinkDialogData();

    const dialogRef = this.dialog.open(LinkCreateOrEditComponent, {
      disableClose: true,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const linkData: LinkDialogData = result as LinkDialogData;
      if ((linkData !== null) && (linkData !== undefined)) {
        if (linkData.cancel === false) {
          this.loadingDialogService.showLoading(`Create new link (${linkData.label}). Please wait.`);
          this.linkService.createLink(linkData.url, linkData.label, linkData.description).subscribe(res => {
            console.log(res);
            this.links.push(res);
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation(`Link (${linkData.label}) has been succesfully created`);
          },
          errorReceived => {
            const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(error.description);
              } else {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError('Error creating link: ' + error.description);
              }
          });
        }
      }
    });
  }
}

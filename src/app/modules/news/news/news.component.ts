import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewsDialogData, ValidationDialogData } from 'src/app/models/dialog-data.model';
import { News } from 'src/app/models/news.models';
import { SoSTradesError } from 'src/app/models/sos-trades-error.model';
import { LoadingDialogService } from 'src/app/services/loading-dialog/loading-dialog.service';
import { NewsService } from 'src/app/services/news/news.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UserService } from 'src/app/services/user/user.service';
import { ValidationDialogComponent } from 'src/app/shared/validation-dialog/validation-dialog.component';
import { NewsCreateOrEditComponent } from '../news-create-or-edit/news-create-or-edit.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

public news: News[];
public newsFiltered: News[];
public hasAccessToStudyManager: boolean;
public isLoading: boolean;
public displayLastNews: boolean;
public message: string;
constructor(
  private dialog: MatDialog,
  private newsService: NewsService,
  private snackbarService: SnackbarService,
  private loadingDialogService: LoadingDialogService,
  private userService: UserService
) {
  this.displayLastNews = true;
  this.isLoading = true;
  this.news = [];
  this.hasAccessToStudyManager = false;
  }

ngOnInit(): void {

  // Check if user has access to create, update, delete
  this.hasAccessToStudyManager = this.userService.hasAccessToStudyManager();
  this.loadAllnews();
}

loadAllnews() {
  // Retrieve all news information
  this.newsService.getAllNews().subscribe(news => {

    this.news = news;
    this.newsFiltered = news;
    this.clickToDisplayAllOrOneNew();
    this.isLoading = false;
  }, errorReceived => {
    const error = errorReceived as SoSTradesError;
    if (error.redirect) {
      this.snackbarService.showError(error.description);
    } else {
      this.news = [];
      this.snackbarService.showError('Error loading news information : ' + error.description);
    }
  });
}

clickToDisplayAllOrOneNew() {

  if (this.displayLastNews) {
    this.displayLastNews = false;
    this.newsFiltered = this.news.slice(0, 1);

   } else {
    this.displayLastNews = true;
    this.newsFiltered = this.news;
 }
}
displayAllOrOneNew() {
  // Show one or all news
  if (!this.displayLastNews) {
    this.newsFiltered = this.news.slice(0, 1);
  } else {
    this.newsFiltered = this.news;
  }
}

onCreate() {
  const dialogData: NewsDialogData = new NewsDialogData();

  const dialogRef = this.dialog.open(NewsCreateOrEditComponent, {
    disableClose: true,
    width: '600px',
    height: '300px',
    data: dialogData
  });

  dialogRef.afterClosed().subscribe(result => {
    const newsDialogData: NewsDialogData = result as NewsDialogData;
    if ((newsDialogData !== null) && (newsDialogData !== undefined)) {
      if (newsDialogData.cancel === false) {
        this.loadingDialogService.showLoading(`Create a news. Please wait.`);
        this.newsService.createNews(newsDialogData.message).subscribe(response => {

          // Add news on top of news and newsFiltered table
          this.news.unshift(response);

          this.displayAllOrOneNew();

          this.loadingDialogService.closeLoading();
          this.snackbarService.showInformation(`The news has been succesfully created`);
        },
        errorReceived => {
          const error = errorReceived as SoSTradesError;
          if (error.redirect) {
            this.loadingDialogService.closeLoading();
            this.snackbarService.showError(error.description);
          } else {
            this.loadingDialogService.closeLoading();
            this.snackbarService.showError('Error creating news: ' + error.description);
          }
        });
      }
    }
  });
}

  onEdit(news: News) {
    const dialogData: NewsDialogData = new NewsDialogData();
    dialogData.message = news.message;

    const dialogRef = this.dialog.open(NewsCreateOrEditComponent, {
      disableClose: true,
      width: '600px',
      height: '300px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      const newsDialogData: NewsDialogData = result as NewsDialogData;
      if ((newsDialogData !== null) && (newsDialogData !== undefined)) {
        if (newsDialogData.cancel === false) {
          this.loadingDialogService.showLoading(`Update message. Please wait.`);
          this.newsService.updateNews(news.id, newsDialogData.message).subscribe(response => {
            this.loadingDialogService.closeLoading();
            this.snackbarService.showInformation(`The message has been succesfully updated`);
            news.message = response.message;
            news.lastModificationDate = response.lastModificationDate;

            // Sort news by lastModicationDate
            this.newsFiltered = this.news.sort((a, b) =>
              new Date(b.lastModificationDate).getTime() - new Date(a.lastModificationDate).getTime());

            this.displayAllOrOneNew();
          },
          errorReceived => {
            const error = errorReceived as SoSTradesError;
            if (error.redirect) {
              this.loadingDialogService.closeLoading();
              this.snackbarService.showError(error.description);
            } else {
              this.loadingDialogService.closeLoading();
              this.snackbarService.showError('Error updating news: ' + error.description);
            }
          });
        }
      }
    });
  }

  onDelete(news: News) {
    const validationDialogData = new ValidationDialogData();
    if (news.message.length >= 100) {
      news.message = news.message.slice(0, 100) + '...';
    }
    validationDialogData.title = 'Confirm deletion';
    validationDialogData.message = `You are about to delete the message '${news.message}'.\nThis action cannot be reverted, are you sure you want to proceed ?`;
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
            this.loadingDialogService.showLoading(`Delete news. Please wait.`);
            this.newsService.deleteNews(news).subscribe(() => {

              // Remove news from table news and newsFiltered
              const newsIndex = this.news.findIndex((currentNew) => currentNew.id === news.id);
              if ((newsIndex >= 0) && (newsIndex < this.news.length)) {
                this.news.splice(newsIndex, 1);
                this.displayAllOrOneNew();
              }
              this.loadingDialogService.closeLoading();
              this.snackbarService.showInformation(`The news (${news.message}) has been succesfully deleted`);
            },
            errorReceived => {
              const error = errorReceived as SoSTradesError;
              if (error.redirect) {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError(error.description);
              } else {
                this.loadingDialogService.closeLoading();
                this.snackbarService.showError('Error deleting news: ' + error.description);
              }
            });
          }
        }
      }
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { DataHttpService } from '../http/data-http/data-http.service';
import { News } from 'src/app/models/news.models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NewsService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
    super (location, 'news');
  }


  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiRoute}`, this.options).pipe(map(
      response => {
        const news: News[] = [];
        response.forEach(actuality => {
          news.push(News.Create(actuality));
        });
        return news;
      }));
  }

  createNews(newMessage: string): Observable<News> {
    const payload = {
      message : newMessage,
    };

    return this.http.post<News>(`${this.apiRoute}`, payload, this.options).pipe(map(
      response => {
        return News.Create(response);
      }));
  }

  updateNews(NewsIdentifier: number, newMessage: string): Observable<News> {
    const payload = {
      message: newMessage,
    };

    return this.http.post<News>(`${this.apiRoute}/${NewsIdentifier}`, payload, this.options).pipe(map(
      response => {
        return News.Create(response);
      }));
  }

  deleteNews(news: News) {
    return this.http.delete(`${this.apiRoute}/${news.id}`, this.options);
  }
}

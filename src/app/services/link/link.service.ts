import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Link } from 'src/app/models/link.model';
import { DataHttpService } from '../http/data-http/data-http.service';

@Injectable({
  providedIn: 'root'
})
export class LinkService extends DataHttpService {

  constructor(
    private http: HttpClient,
    private location: Location) {
    super(location, 'link');
  }


  loadAllLinks(): Observable<Link[]> {
    return this.http.get<Link[]>(`${this.apiRoute}`, this.options).pipe(map(
      response => {
        const links: Link[] = [];
        response.forEach(link => {
          links.push(Link.Create(link));
        });
        return links;
      }));
  }

  loadLinkById(linkIdentifier: number): Observable<Link> {
    return this.http.get<Link>(`${this.apiRoute}/${linkIdentifier}`, this.options).pipe(map(
      response => {
          return Link.Create(response);
      }));
  }

  createLink(url: string, label: string, description: string): Observable<Link> {
    const payload = {
      'url': url,
      'label': label,
      'description': description
    };

    return this.http.post<Link>(`${this.apiRoute}`, payload, this.options).pipe(map(
      response => {
        return Link.Create(response);
      }));
  }

  updateLink(identifier: number, url: string, label: string, description: string): Observable<Link> {
    const payload = {
      'id': identifier,
      'url': url,
      'label': label,
      'description': description
    };

    return this.http.put<Link>(`${this.apiRoute}/${identifier}`, payload, this.options);
  }

  deleteLink(link: Link) {
    return this.http.delete(`${this.apiRoute}/${link.id}`, this.options);
  }


}

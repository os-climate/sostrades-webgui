import { Injectable } from '@angular/core';
import { Filters } from 'src/app/models/filters.model';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  public filters: Filters;

  constructor() {
    this.filters = new Filters(1, true); // 1 => Standard user, True => Show Editable data
  }
}

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  log(...args: any) {
    if (environment.production === false) {
      console.log(args);
    }
  }
}

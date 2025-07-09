import { Injectable } from '@angular/core';
import { Meta } from "@angular/platform-browser";

@Injectable({
  providedIn: 'root'
})
export class EmbedDashboardService {

  constructor(private meta: Meta) {}

  allowEmbedding(): void {
    this.meta.removeTag("name='x-frame-options'");
    this.meta.addTag({
      name: 'Content-Security-Policy',
      content: "frame-ancestors *;"
    });
  }

  isEmbbed(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      // if we can not access window.top due to security restrictions
      // we are probably in an iframe
      return true
    }
  }
}

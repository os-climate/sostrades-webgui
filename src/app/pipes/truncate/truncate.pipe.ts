import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: any, limit: number): string {
    if (!value) return '';
    if (!value.toString()) return '';
    if (value.toString().length <= limit) return value.toString();
    return value.toString().slice(0, limit) + '...';
  }

}

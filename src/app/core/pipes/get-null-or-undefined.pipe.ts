import { Pipe, PipeTransform } from '@angular/core';
import {isNullOrUndefined} from '@swimlane/ngx-datatable';

@Pipe({
  name: 'getNullOrUndefined'
})
export class GetNullOrUndefinedPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!isNullOrUndefined(value) &&  value !== '') {
      return value;
    }
    return '-';
  }

}

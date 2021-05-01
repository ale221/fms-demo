import { Pipe, PipeTransform } from '@angular/core';
import {isNullOrUndefined} from "@swimlane/ngx-datatable";

@Pipe({
  name: 'formatString'
})
export class FormatStringPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if(isNullOrUndefined(value)) return '-';
    value = value.replace(/_/g, " ");
    return (!!value) ? value.charAt(0).toUpperCase() + value.substr(1).toLowerCase() : '';

  }

}

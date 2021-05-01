import { Pipe, PipeTransform } from '@angular/core';
import {format} from 'date-fns';

@Pipe({
  name: 'myDatePipe'
})
export class MyDatePipePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let dateFormat = 'M/D/YYYY, h:mm:ss A';
    if (value) {
      const dateValue = new Date(value);

      const dateWithNoTimezone = new Date(
        dateValue.getUTCFullYear(),
        dateValue.getUTCMonth(),
        dateValue.getUTCDate(),
        dateValue.getUTCHours(),
        dateValue.getUTCMinutes(),
        dateValue.getUTCSeconds()
      );
      if (args === 'short') {
        dateFormat = 'M/D/YYYY, h:mm:ss a';
      }
      else { dateFormat = args; }
      return format((dateWithNoTimezone), dateFormat);
    }
    else { return '-'; }
  }

}

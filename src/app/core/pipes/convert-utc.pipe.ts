import { Pipe, PipeTransform } from '@angular/core';
import {addMinutes} from "date-fns";

@Pipe({
  name: 'convertUtc'
})
export class ConvertUtcPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const localDateTime = addMinutes(value, -(new Date().getTimezoneOffset()));
    console.log(value, localDateTime);
    return localDateTime;
  }

}

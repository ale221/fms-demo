import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'booleanToYesNo'
 })
 export class booleanToYesNo implements PipeTransform {
    transform(value: boolean): string {
       if (value == true)
          return 'Yes';
       else
          return 'No';
    }
 }
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeUnderScore'
 })
 export class removeUnderScore implements PipeTransform {
    transform(value: string): string {
       if (value != undefined)
          return value.replace(/_/g, ' ');
       else
          return value;
    }
 }
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringifyArray'
})
export class StringifyArrayPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.toString();
  }

}

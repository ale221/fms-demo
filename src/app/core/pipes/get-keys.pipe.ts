import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getKeys'
})
export class GetKeysPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value) {
      return Object.keys(value);
    }
    return null;
  }

}

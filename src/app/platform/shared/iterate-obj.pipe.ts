import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'iterateObj'
})
export class IterateObjPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return Object.keys(value);
  }

}

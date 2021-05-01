import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'checkKey'
})
export class CheckKeyPipe implements PipeTransform {

  transform(value: any, args: any): any {
    if(value && value.hasOwnProperty(args))
      return value[args];
    return '-';
  }

}

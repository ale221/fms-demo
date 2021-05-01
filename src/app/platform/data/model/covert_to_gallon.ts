import {isNullOrUndefined} from 'util';

export class ConvertToGallon {
  value: any;


  static convert_to_gallon(value: any, roundOff = false) {
    if (!isNullOrUndefined(value)) {
      let valueGallon  = value * 0.219;
      if (roundOff) {
        valueGallon = +valueGallon.toFixed(2);
      }
      return valueGallon;
    }
    return 0;
  }
}

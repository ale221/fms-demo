import { FormControl } from '@angular/forms';
import { validation_patterns } from '../validation_patterns';


export function validateDate(control: FormControl) {
 let currentDate = new Date();
 currentDate.getTime();
 let validDate = new Date(control.value);
 validDate.getTime()
  if (validDate.getTime()>currentDate.getTime()) {
    return {
        invalid_date: "invalid_date"
      }

  }
  return null;
}

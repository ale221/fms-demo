import { FormControl } from '@angular/forms';
import { validation_patterns } from '../validation_patterns';

function validateEmail(control: FormControl) {
    let email = control.value;
    if (!email.match(validation_patterns.email_regex)) {
        return {
          invalid_email: 'Invalid Email'
        }

    }
    return null;
}

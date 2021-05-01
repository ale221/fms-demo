import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class CaretakerGuardService implements CanActivate {

  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isCaretaker()) {
      // Is a caretaker so redirect to caretaker page.
      this.router.navigate(['/ioa/caretaker']);
      return false;
    }

    return true;
  }
}

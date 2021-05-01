import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';

@Injectable()
export class UserGuardService implements CanActivate {

  constructor(private route: Router,
              private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.getUser().user_role_id === UserRoleEnum.Admin) {
      return true;
    }
    if (this.authService.isCaretaker()) {
      return true;
    }
    this.route.navigate(['']);
    return false;
  }
}

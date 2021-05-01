import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EntityStatusEnum } from '../enum/entity-type.enum';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private router: Router,
    private authService: AuthService) {
  }

  canLoad(route: Route) {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUser();
      if (user.user_role_id == UserRoleEnum.User || user.status === EntityStatusEnum.Inactive) {
        this.router.navigate(['unauthorized']);
        return false;
      }
      return true;

    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/']);
    return false;
  }
}

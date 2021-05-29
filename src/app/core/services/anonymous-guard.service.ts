import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import {hypernymModules, iolModules} from "../model/module";
import {isNullOrUndefined} from "util";

@Injectable({
  providedIn: 'root'
})
export class AnonymousGuardService implements CanActivate {

  constructor(private router: Router,
              private authService: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.isLoggedIn()) {
      // logged in so return false
      let module_id = this.authService.getUser().preferred_module;
      if (module_id < 2) {
        let module = iolModules[module_id];
        if(isNullOrUndefined(module)) module = '';
        this.router.navigate(['/iol/' + module]);
      }
      else {
        // console.log("redirect",hypernymModules[module_id]);
        if(isNullOrUndefined(hypernymModules[module_id])) this.authService.unsetUser();
        else this.router.navigate(['/' + hypernymModules[module_id]]);
      }

      return false;
    }
    return true;
  }

}

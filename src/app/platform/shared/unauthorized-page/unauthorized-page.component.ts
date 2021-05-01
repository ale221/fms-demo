import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { EntityStatusEnum } from 'src/app/core/enum/entity-type.enum';
import { PackageType } from 'src/app/core/enum/packages-enum';

@Component({
  selector: 'app-unauthorized-page',
  templateUrl: './unauthorized-page.component.html',
  styleUrls: ['./unauthorized-page.component.css']
})
export class UnauthorizedPageComponent implements OnInit {

  constructor(private route: Router, private  authService: AuthService) {
  }
  authRoutes;
  pkgRoutes = [];

  msg = 'You are not authorized to view this page. Please contact Administrator.';

  @Output() isAuthorized = new EventEmitter<any>();
  @Output() packageRoutes = new EventEmitter<any>();

  ngOnInit() {
    const user = this.authService.getUser();
    this.authRoutes = [];
    if (user['menuaccess'] && user['menuaccess'].length > 0) {
      user['menuaccess'].forEach(element => {
        if (element.child && element.child.length > 0) {
          element.child.forEach(child => {
            if (child.id && user['package'][0].package_id === PackageType.standard) {
              this.authRoutes.push(child.route);
            }
            if (child.id && user['package'][0].package_id === PackageType.png && child.plug_and_go) {
              this.authRoutes.push(child.route);
            }
          });
        }
      });
    }

    if (user['package'] && user['package'][0].detail.length > 0) {
      user['package'][0].detail.forEach(element => {
        this.pkgRoutes.push(element);
      });
    }

    let currentRoute = (window.location.pathname).replace('/iol/', '');

    if (currentRoute === '/iol') {
      currentRoute = "";
    }

    if (currentRoute.search("/") && user['package'][0].package_id === PackageType.png) {
      if (currentRoute.split("/")[0] === 'fleets' || currentRoute.split("/")[0] === 'drivers') {
        currentRoute = currentRoute.split("/")[0];
      }
      if(this.authRoutes.includes(currentRoute)) {
        this.isAuthorized.emit(true);
        this.packageRoutes.emit(this.pkgRoutes);
      }
    }

    if (user['package'][0].package_id === PackageType.standard) {
      if (currentRoute.split("/")[0] === 'fleets' || currentRoute.split("/")[0] === 'drivers') {
        currentRoute = currentRoute.split("/")[0];
      }
      if(this.authRoutes.includes(currentRoute)) {
        this.isAuthorized.emit(true);
        this.packageRoutes.emit(this.pkgRoutes);
      }
    }

  }

  logout() {
    this.authService.unsetUser();
    this.route.navigateByUrl('/');
  }
}

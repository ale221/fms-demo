import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';

export interface CanDeactivateComponent {
  deactivate: boolean;
  nextUrl: string;
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable()
export class CanDeactivateService implements CanDeactivate<CanDeactivateComponent> {
  canDeactivate(component: CanDeactivateComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log(nextState.url + '  herheh' + nextState.root);
    component.nextUrl = nextState.url;
    return (() => component.canDeactivate())();
  }

}

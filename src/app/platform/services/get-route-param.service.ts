import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetRouteParamService {

  constructor() {
  }

  selectedId;

  getParams(routeObj) {
    routeObj.params.subscribe(params => {
      this.selectedId = +params['id']; // (+) converts string 'id' to a number
      // console.log('id changed', this.selectedId);

    });
    return this.selectedId;

  }

}

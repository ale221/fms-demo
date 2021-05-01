import { Injectable } from '@angular/core';
import { isNullOrUndefined } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GotoPageService {

  constructor(private router: Router) {
  }

  public gotoTruck(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/fleets/' + id;
    }

  }

  public gotoQuickView() {
    return '/iol/quick-view';
  }

  public gotoVessel(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/vessels/' + id;
    }

  }

  public gotoPageWithQueryParams(pageName: string, queryObj) {
    this.router.navigate(['ffp/' + pageName], { queryParams: queryObj });
  }

  public gotoViolations(params?) {
    return '/ffp/violations/';
  }

  public gotoBin(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/bins/' + id;
    }

  }

  public gotoClient(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/client/' + id;
    }

  }

  public gotoMaintenaces(id) {
    if (isNullOrUndefined(id)) {
      return '/iol/maintenance';
    } else {
      return '/iol/maintenance/' + id;
    }

  }

  public gotoDriver(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/drivers/staff/' + id;
    }

  }

  public gotoRouteDetail(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/route/' + id;
    }

  }

  // public gotoJob(id, jobStatusId) {
  //   if(isNullOrUndefined(id))
  //     return null;
  //   else
  //     return ['/iol/jobs', id, jobStatusId ];
  //
  // }


  public gotoDrivers() {
    return '/iol/staff/';
  }

  public gotoTrucks() {
    return '/iol/fleets/';
  }

  public gotoJobs() {
    return '/iol/jobs/';
  }

  public gotoTerritories() {
    return '/iol/territories/';
  }

  public gotoAreaDashboard() {
    return '/iol/area';
  }

  public gotoLocationDashboard() {
    return '/iol/locaiton';
  }

  public gotoClientForm() {
    return '/iol/admin/client/';

  }

  public gotoSchedule() {
    return '/iol/schedule';

  }

  public gotoDumpDashboard() {
    return '/iol/dump';

  }

  public gotoBins() {
    return '/iol/bins';

  }

  public gotoVessels() {
    return '/iol/vessels';

  }


  public gotoZone(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/ffp/zone/' + id;
    }

  }

  public gotoSite(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/ffp/sites/' + id;
    }

  }

  public gotoEmployee(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/ffp/employees/' + id;
    }

  }

  public gotoHeater(id = 1) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iop/waterheater/' + id;
    }
  }

  public gotoCMSVehiclePage(id) {
    return '/iol/fleets/' + id;
  }

  public gotoVehicles() {
    return '/iol/fleets/';
  }

  // driver dashboard router links function
  public gotoDriverJobDashboard(id) {
    if (isNullOrUndefined(id)) {
      return null;
    } else {
      return '/iol/drivers/driverJob/' + id;
    }
  }
  // end


}

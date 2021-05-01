import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverProfileReportingComponent } from '../driver-profile-reporting/driver-profile-reporting.component';
import { DriverSaftyReportingComponent } from '../driver-safty-reporting/driver-safty-reporting.component';

const routes: Routes = [
  {
    path: '',
    component: DriverProfileReportingComponent
  },
  {
    path: 'saftey-reporting',
    component: DriverSaftyReportingComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DriverReportingRoutingModule { }

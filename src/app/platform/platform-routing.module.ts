import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../core/dashboard/dashboard.component';
import { HelppageComponent } from '../core/helppage/helppage.component';
import { IolDashboardComponent } from './iol-dashboard/iol-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CanDeactivateService } from './shared/can-deactivate.service';
import { NotificationsDashboardComponent } from './notifications-dashboard/notifications-dashboard.component';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, 
    children: [
      { path: '', component: IolDashboardComponent },
      { path: 'admin', loadChildren: () => import('./admin-forms/admin-forms.module').then(m => m.AdminFormsModule) },
      { path: 'fleets', loadChildren: () => import('./fleets/fleets.module').then(m => m.FleetsModule) },
      { path: 'drivers', loadChildren: () => import('./drivers/drivers.module').then(m => m.DriversModule) },
      { path: 'maintenance', loadChildren: () => import('./maintenance/maintenance.module').then(m => m.MaintenanceModule) },
      { path: 'reports', loadChildren: () => import('./Reports/driver-reporting-module/driver-reporting.module').then(m => m.DriverReportingModule) },
      // { path: 'vehicles', loadChildren:'./vehicles/vehicles.module#VehiclesModule' },
       { path: 'quick-view', loadChildren:() => import('./play-back/play-back.module').then(m => m.PlayBackModule) },
      // { path: 'staff', loadChildren:'./staff/staff.module#StaffModule' },
      { path: 'templates', loadChildren:() => import('./jobs/jobs.module').then(m => m.JobsModule) },
      { path: 'territories', loadChildren:() => import('./territories/territories.module').then(m => m.TerritoriesModule) },
      { path: 'violations', loadChildren:() => import('./violations/violations.module').then(m => m.ViolationsModule) },
      { path: 'audit', loadChildren: () => import('./auditForm/audit.module').then(m => m.AuditModule) },
      { path: 'help',  component: HelppageComponent },
      {
        path: 'profile',
        component: UserProfileComponent,
      },
      {
        path: 'notifications',
        component: NotificationsDashboardComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformRoutingModule { }

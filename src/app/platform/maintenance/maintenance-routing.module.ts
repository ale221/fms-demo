import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaintenanceDashboardComponent } from './maintenance-dashboard/maintenance-dashboard.component';
import { MaintenanceDetailComponent } from './maintenance-detail/maintenance-detail.component';
import { MaintenanceSummaryComponent } from './maintenance-summary/maintenance-summary.component';
import { ManageMaintenanceComponent } from './manage-maintenance/manage-maintenance.component';
import { PredictiveMaintenanceComponent } from './predictive-maintenance/predictive-maintenance.component';

const routes: Routes = [
  {
    path: '',
    component: MaintenanceDashboardComponent
  },
  {
    path: 'job/summary',
    component: MaintenanceSummaryComponent,
  },
  {
    path: 'manage/maintenance',
    component: ManageMaintenanceComponent
  },
  {
    path: ':id',
    component: MaintenanceDetailComponent,
  },
  {
    path: 'predictive/maintenance', //'maintenance/predictive-maintenance'
    component: PredictiveMaintenanceComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule { }

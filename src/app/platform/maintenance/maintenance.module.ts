import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { MaintenanceDashboardComponent } from './maintenance-dashboard/maintenance-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BsModalService } from 'ngx-bootstrap/modal';
import { MaintenanceDetailComponent } from './maintenance-detail/maintenance-detail.component';
import { AdminMaintenanceFormComponent } from '../admin-maintenance-form/admin-maintenance-form.component';
import { MaintenanceDataFormComponent } from '../maintenance-data-form/maintenance-data-form.component';
import { MaintenanceSummaryComponent } from './maintenance-summary/maintenance-summary.component';
import { ManageMaintenanceComponent } from './manage-maintenance/manage-maintenance.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PredictiveMaintenanceComponent } from './predictive-maintenance/predictive-maintenance.component'

@NgModule({
  declarations: [
    MaintenanceDashboardComponent,
    MaintenanceDetailComponent,
    AdminMaintenanceFormComponent,
    MaintenanceDataFormComponent,
    MaintenanceSummaryComponent,
    ManageMaintenanceComponent,
    PredictiveMaintenanceComponent
  ],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
    MatTabsModule
  ],
  providers: [BsModalService],
  entryComponents: [AdminMaintenanceFormComponent, MaintenanceDataFormComponent]
})
export class MaintenanceModule { }

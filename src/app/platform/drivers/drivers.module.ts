import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriversRoutingModule } from './drivers-routing.module';
import { DriversDashboardComponent } from './drivers-dashboard/drivers-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ConnectionResolver } from '../route.resolver';
import { DriverDetailComponent } from './driver-detail/driver-detail.component';
import { GoogleMapDriverDashboardComponent } from './driver-map/google-map-driver-dashboard/google-map-driver-dashboard.component';
import { DriverJobDashboardComponent } from './driver-job-dashboard/driver-job-dashboard.component';
import { MatTabsModule } from '@angular/material/tabs'
import { CdkDetailRowDirective } from './drivers-dashboard/cdk-detail-row.directive';
import { ManageShiftsComponent } from './manage-shifts/manage-shifts.component';
import { DashBoardDriverComponent } from './dash-board-driver/dash-board-driver.component';
import { DriverVehicleAllocationComponent } from './driver-vehicle-allocation/driver-vehicle-allocation.component';
import { DriverShiftAllocationComponent } from './driver-shift-allocation/driver-shift-allocation.component';
import { SignalRModule, SignalRConfiguration } from 'src/app/core/wfw-ngx-signalr';
import { MatCheckboxModule } from '@angular/material/checkbox';
export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  c.url = 'https://staging.broadcaster.iot.vodafone.com.qa'; //'http://reliance-signalr-hypernet.southeastasia.cloudapp.azure.com:8080/signalr';
  c.hubName = 'EventHubMessages';
  c.logging = false;
  c.withCredentials = true;
  return c;
}

@NgModule({
  declarations: [
    DriversDashboardComponent,
    CdkDetailRowDirective,
    DriverDetailComponent,
    DriversDashboardComponent,
    GoogleMapDriverDashboardComponent,
    DriverJobDashboardComponent,
    ManageShiftsComponent,
    DashBoardDriverComponent,
    DriverVehicleAllocationComponent,
    DriverShiftAllocationComponent
  ],
  imports: [
    CommonModule,
    SignalRModule.forRoot(createConfig),
    DriversRoutingModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
    MatCheckboxModule
  ],
  providers: [
    ConnectionResolver
  ],
})
export class DriversModule { }

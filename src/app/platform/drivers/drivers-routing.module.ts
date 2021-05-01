import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignalRConfiguration, SignalRModule } from 'src/app/core/wfw-ngx-signalr';
import { ConnectionResolver } from '../route.resolver';
import { DashBoardDriverComponent } from './dash-board-driver/dash-board-driver.component';
import { DriverDetailComponent } from './driver-detail/driver-detail.component';
import { DriverJobDashboardComponent } from './driver-job-dashboard/driver-job-dashboard.component';
import { DriverShiftAllocationComponent } from './driver-shift-allocation/driver-shift-allocation.component';
import { DriverVehicleAllocationComponent } from './driver-vehicle-allocation/driver-vehicle-allocation.component';
import { DriversDashboardComponent } from './drivers-dashboard/drivers-dashboard.component';
import { ManageShiftsComponent } from './manage-shifts/manage-shifts.component';


const routes: Routes = [
  {
    path: '',
    component: DriversDashboardComponent,
    resolve: { connection: ConnectionResolver }
  },
  {
    path: 'staff/:id',
    component: DriverDetailComponent,
    resolve: { connection: ConnectionResolver }
  },
  {
    path: 'driverJob/:id',
    component: DriverJobDashboardComponent,
    resolve: { connection: ConnectionResolver }
  },
  {
    path: 'shifts',
    component:ManageShiftsComponent
  },
  {
    path:'dashboarddriver',
    component:DashBoardDriverComponent,
    resolve: { connection: ConnectionResolver }
  },
  {
    path:'allocation',
    component:DriverVehicleAllocationComponent
  },
  {
    path:'shiftallocation',
    component: DriverShiftAllocationComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class DriversRoutingModule { }

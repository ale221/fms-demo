import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectionResolver } from '../route.resolver';
import { FleetDashboardComponent } from './fleet-dashboard/fleet-dashboard.component';
import { FleetDetailComponent } from './fleet-detail/fleet-detail.component';
import { FleetPoiComponent } from './fleet-poi/fleet-poi.component';

const routes: Routes = [
  {
    path: '', 
    component: FleetDashboardComponent,
    resolve: { connection: ConnectionResolver }
  },
  {
    path: 'flt/poi', 
    component: FleetPoiComponent
  },
  {
    path: ':id', 
    component: FleetDetailComponent,
    resolve: { connection: ConnectionResolver }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetsRoutingModule { }

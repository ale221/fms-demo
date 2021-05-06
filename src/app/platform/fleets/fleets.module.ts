import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { FillupReportingComponent } from '../reporting/fillup-reporting/fillup-reporting.component';
import { IgnitionReportingComponent } from '../reporting/ignition-reporting/ignition-reporting.component';
// import { GroupedVerticalBarChartComponent } from '../shared/grouped-vertical-bar-chart/grouped-vertical-bar-chart.component';
import { ConnectionResolver } from '../route.resolver';
import { SignalRModule, SignalRConfiguration } from 'src/app/core/wfw-ngx-signalr';

export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  c.url =  environment.signalR; //'http://reliance-signalr-hypernet.southeastasia.cloudapp.azure.com:8080/signalr';
  c.hubName = 'EventHubMessages';
  c.logging = false;
  c.withCredentials = true;
  return c;
}

import { FleetsRoutingModule } from './fleets-routing.module';
import { FleetDashboardComponent } from './fleet-dashboard/fleet-dashboard.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FleetDetailComponent } from './fleet-detail/fleet-detail.component';
import { MaintenanceReportingComponent } from '../reporting/maintenance-reporting/maintenance-reporting.component';
import { ViolationReportingComponent } from '../reporting/violation-reporting/violation-reporting.component';
import { CdkDetailRowDirective } from './fleet-dashboard/cdk-detail-row.directive';
import { FleetPoiComponent } from './fleet-poi/fleet-poi.component';
import { environment } from 'src/environments/environment';
// import { SpdmeterchartComponent } from '../shared/spdmeterchart/spdmeterchart.component';

@NgModule({
  declarations: [
    FleetDashboardComponent,
    CdkDetailRowDirective,
    FleetDetailComponent,
    FillupReportingComponent,
    IgnitionReportingComponent,
    MaintenanceReportingComponent,
    ViolationReportingComponent,
    FleetPoiComponent,
    // SpdmeterchartComponent
    // GroupedVerticalBarChartComponent,
  ],
  imports: [
    CommonModule,
    SignalRModule.forRoot(createConfig),
    FleetsRoutingModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
  ],
  providers: [
    ConnectionResolver
  ],
})
export class FleetsModule { }

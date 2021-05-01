
import { LinechartComponent } from './line-chart/linechart.component';
import { DropdownComponent } from './dropdown/dropdown.component';
// import {CardComponent} from './card/card.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { RouterModule } from '@angular/router';

import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Daterangepicker } from 'ng2-daterangepicker';
import { ChartsModule } from 'ng2-charts';
import { IterateObjPipe } from './iterate-obj.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import {DoughnutChartComponent} from './doughnut-chart/doughnut-chart.component';
// import {NgxChartsModule} from '@swimlane/ngx-charts';
// import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { DataNotFoundComponent } from './data-not-found/data-not-found.component';
import { FormatStringPipe } from './format-string.pipe';
import { SpinLoadingComponent } from './spin-loading/spin-loading.component';
// import {GrowlModule} from 'primeng/growl';
import { BrandingService } from '../shared/services/branding.service';

import {
  AutoCompleteModule
} from 'primeng/autocomplete';


import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
// import {DataListModule} from 'primeng/primeng';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgAutoCompleteModule } from 'ng-auto-complete';
// import {ConfirmDialogModule, ConfirmationService} from 'primeng/primeng';
import { CanDeactivateService } from './can-deactivate.service';
// import {StackedBarChartComponent} from './stacked-bar-chart/stacked-bar-chart.component';
// import {BreadcrumbsComponent} from './breadcrumbs/breadcrumbs.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ResizeDatatableService } from './resize-datatable.service';
// import {LabelLoaderComponent} from './label-loader/label-loader.component';
import { UnauthorizedPageComponent } from './unauthorized-page/unauthorized-page.component';
// import {TableSearchComponent} from './table-search/table-search.component';
import { StringifyArrayPipe } from './pipes/stringify-array.pipe';
import { StatsIconCardComponent } from './stats-icon-card/stats-icon-card.component';
import { StatsIconCardSmComponent } from './stats-icon-card-sm/stats-icon-card-sm.component';
import { ClientService } from './services/client.service';
import { GlobalSearchBar } from '../global-search-bar/global-search-bar.component';
import { ExportCsvComponent } from './export-csv/export-csv.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GoogleMapComponent } from '../google-map/google-map.component';
import { ReportingButtonsComponent } from './reporting-buttons/reporting-buttons.component';
import { GetNullOrUndefinedPipe } from 'src/app/core/pipes/get-null-or-undefined.pipe';
import { ConvertUtcPipe } from 'src/app/core/pipes/convert-utc.pipe';
import { AbsolutePipe } from 'src/app/core/pipes/absolute.pipe';
import { GetKeysPipe } from 'src/app/core/pipes/get-keys.pipe';
import { CheckKeyPipe } from 'src/app/core/pipes/check-key.pipe';
import { MyDatePipePipe } from 'src/app/core/pipes/my-date-pipe.pipe';
import { DataTablePagerComponent } from './pager-datatable/pager-component';
// import { ActivityReportingComponent } from '../reporting/activity-reporting/activity-reporting.component';
// import { CollectionReportingComponent } from '../reporting/collection-reporting/collection-reporting.component';
// import { MaintenanceReportingComponent } from '../reporting/maintenance-reporting/maintenance-reporting.component';
// import { ShiftReportingComponent } from '../reporting/shift-reporting/shift-reporting.component';
// import { ViolationReportingComponent } from '../reporting/violation-reporting/violation-reporting.component';
// import { TruckReportingComponent } from '../reporting/truck-reporting/truck-reporting.component';
// import { TruckMonthlyReportingComponent } from '../reporting/truck-monthly-reporting/truck-monthly-reporting.component';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DefaultLoaderComponent } from './default-loader/default-loader.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AreaChartComponent } from './area-chart/area-chart.component';
import { TreeChartComponent } from './tree-chart/tree-chart.component';
import { MultiBarChartComponent } from './multi-bar-chart/multi-bar-chart.component';
import { FunnelChartComponent } from './funnel-chart/funnel-chart.component';
import { FusionChartsModule } from "angular-fusioncharts";

// Import FusionCharts library and chart modules
import * as FusionCharts from "fusioncharts";
import * as charts from "fusioncharts/fusioncharts.charts";
import * as FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";
import { StackedBarChartComponent } from './stacked-bar-chart/stacked-bar-chart.component';
import { MantinanceprobabilitychartComponent } from './mantinanceprobabilitychart/mantinanceprobabilitychart.component';
import { FleetdashboardchartComponent } from './fleetdashboardchart/fleetdashboardchart.component';
import { StatisticschartComponent } from './statisticschart/statisticschart.component';
import { ChartComponent } from './chart/chart.component'
import { ChartFiltersComponent } from './chart-filters/chart-filters.component';
import { RadialChartComponent } from './radial-chart/radial-chart.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { DashboardWidgetComponent } from './dashboard-widget/dashboard-widget.component';
import { FiltersComponent } from './filters/filters.component';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { OrderListModule } from 'primeng/orderlist';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { ApxRadialbarStrokedGaugeForkedChartComponent } from './apex-chart-container/apx-radialbar-stroked-gauge-forked-chart/apx-radialbar-stroked-gauge-forked-chart.component';
import { ApexBasicRadialarBarChartComponent } from './apex-chart-container/apex-basic-radialar-bar-chart/apex-basic-radialar-bar-chart.component';
import { ApexLineChartComponent } from './apex-chart-container/apex-line-chart/apex-line-chart.component';
import { ApexBarChartComponent } from './apex-chart-container/apex-bar-chart/apex-bar-chart.component';
import { from } from 'rxjs';
import { SpdmeterchartComponent } from './spdmeterchart/spdmeterchart.component';
import { AccessLayoutComponent } from './access-layout/access-layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from "@angular/material/icon";
import { CustomGraphComponent } from './custom-graph/custom-graph.component';
import { ClusteredGraphComponent } from './clustered-graph/clustered-graph.component';
import { ClusteredBarChartComponent } from './clustered-bar-chart/clustered-bar-chart.component';

const commonComponents: any = [
  GlobalSearchBar,
  BreadcrumbsComponent,
  PieChartComponent,
  AreaChartComponent,
  BarChartComponent,
  TreeChartComponent,
  MultiBarChartComponent,
  FunnelChartComponent,
  StackedBarChartComponent,
  MantinanceprobabilitychartComponent,
  FleetdashboardchartComponent,
  StatisticschartComponent,
  ChartFiltersComponent,
  RadialChartComponent,
  ChartComponent,
  SpdmeterchartComponent,
  UnauthorizedPageComponent,
  CustomGraphComponent,
  ClusteredGraphComponent,
  DropdownComponent,
  LinechartComponent,
  ProgressBarComponent,
  DataNotFoundComponent,
  DefaultLoaderComponent,
  DashboardWidgetComponent,
  FiltersComponent,
  SpinLoadingComponent,
  StatsIconCardComponent,
  StatsIconCardSmComponent,
  ExportCsvComponent,
  GoogleMapComponent,
  ReportingButtonsComponent,
  DataTablePagerComponent,
  ApexBasicRadialarBarChartComponent,
  ApexLineChartComponent,
  ApexBarChartComponent,
  ApxRadialbarStrokedGaugeForkedChartComponent,
  ClusteredBarChartComponent
];

const pipes: any = [
  IterateObjPipe,
  FormatStringPipe,
  ConvertUtcPipe,
  AbsolutePipe,
  GetKeysPipe,
  CheckKeyPipe,
  GetNullOrUndefinedPipe,
  MyDatePipePipe,
  StringifyArrayPipe
];


const commonModules: any = [
  CommonModule,
  RouterModule,
  TooltipModule,
  FormsModule,
  ReactiveFormsModule,
  Daterangepicker,
  ChartsModule,
  NgxDatatableModule,
  CalendarModule,
  NgAutoCompleteModule,
  CollapseModule,
  ProgressBarModule,
  NgxSliderModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule
];


const primengModules = [
  DropdownModule,
  MultiSelectModule,
  TableModule,
  // ListboxModule,
  InputMaskModule,
  CheckboxModule,
  OrderListModule,
  ProgressSpinnerModule,
  // GrowlModule,
  // ConfirmDialogModule,
  AutoCompleteModule,
  // FileUploadModule
];

const commonServices: any = [
  ClientService,
  // ConfirmationService,
  CanDeactivateService,
  ResizeDatatableService
];

// TableSearchComponent Add this in export and declarations

FusionChartsModule.fcRoot(FusionCharts, charts, FusionTheme);

@NgModule({
  imports: [commonModules, primengModules, NgApexchartsModule, FusionChartsModule, BsDatepickerModule.forRoot(), DatepickerModule.forRoot()],
  declarations: [commonComponents, pipes, MaintenanceComponent, UnauthorizedPageComponent, DefaultLoaderComponent,
    AreaChartComponent, TreeChartComponent, MultiBarChartComponent, FunnelChartComponent, StackedBarChartComponent, MantinanceprobabilitychartComponent, StatisticschartComponent, FleetdashboardchartComponent,
    ChartFiltersComponent, RadialChartComponent, ChartComponent, DashboardWidgetComponent, FiltersComponent, SpdmeterchartComponent, AccessLayoutComponent, CustomGraphComponent, ClusteredGraphComponent,
    ClusteredBarChartComponent],
  exports: [commonComponents, commonModules, primengModules, pipes],
  providers: [commonServices, BrandingService]
})

export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [commonServices]
    };
  }
}

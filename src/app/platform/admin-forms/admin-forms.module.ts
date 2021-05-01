import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminFormsRoutingModule } from './admin-forms-routing.module';
import { AdminFuelFormComponent } from './admin-fuel-form/admin-fuel-form.component';
import { SharedModule } from '../shared/shared.module';
// import { AdminFuelReportingComponent } from '../reporting/admin-fuel-reporting/admin-fuel-reporting.component';
import { AdminTruckFormComponent } from './admin-truck-form/admin-truck-form.component';
import { AdminToolFormComponent } from './admin-tool-form/admin-tool-form.component';
import { AdminTerritoryFormComponent } from './admin-territory-form/admin-territory-form.component';
import { AdminClientFormComponent } from './admin-client-form/admin-client-form.component';
import { AdminContractFormComponent } from './admin-contract-form/admin-contract-form.component';
import { AdminDriverFormComponent } from './admin-driver-form/admin-driver-form.component';
import { AdminConfigFormComponent } from './admin-config-form/admin-config-form.component';
import { AdminCardFormComponent } from './admin-card-form/admin-card-form.component';
import { AdminGraphFormComponent } from './admin-graph-form/admin-graph-form.component';
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminFiltersComponent } from '../shared/admin-filters/admin-filters.component';
import { AdminUserFormComponent } from './admin-user-form/admin-user-form.component';
import { AdminPermissionsFormComponent } from './admin-permissions-form/admin-permissions-form.component';
import { AdminRouteComponent } from './admin-routes/admin-routes.component';
import { FileUploadModule } from 'primeng/fileupload';
import { AdminConfigurationsComponent } from './admin-configurations/admin-configurations.component';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CdkDetailRowDirective } from './admin-contract-form/cdk-detail-row.directive';
// import { TemplateformComponent } from '../jobs/templateform/templateform.component';

@NgModule({
  declarations: [
    AdminConfigFormComponent,
    AdminCardFormComponent,
    AdminGraphFormComponent,
    AdminFuelFormComponent,
    // AdminFuelReportingComponent,
    AdminTruckFormComponent,
    AdminToolFormComponent,
    AdminTerritoryFormComponent,
    AdminDriverFormComponent,
    AdminClientFormComponent,
    AdminContractFormComponent,
    AdminFiltersComponent,
    AdminUserFormComponent,
    AdminPermissionsFormComponent,
    AdminRouteComponent,
    AdminConfigurationsComponent,
    CdkDetailRowDirective
    // TemplateformComponent
    // DemoAppComponent

  ],
  imports: [
    CommonModule,
    AdminFormsRoutingModule,
    SharedModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    FileUploadModule,
    AngularDualListBoxModule,
    TranslateModule,
    MatCheckboxModule
  ]
})
export class AdminFormsModule { }


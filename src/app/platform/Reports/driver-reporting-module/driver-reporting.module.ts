import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverReportingRoutingModule } from './driver-reporting-routing.module';
import { DriverProfileReportingComponent } from '../driver-profile-reporting/driver-profile-reporting.component';
import { ConnectionResolver } from '../../route.resolver';
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FileUploadModule } from 'primeng/fileupload';
import { AdminFormsRoutingModule } from '../../admin-forms/admin-forms-routing.module';
import { CalendarModule } from 'primeng';
import {DropdownModule} from 'primeng/primeng';
import { CdkDetailRowDirective } from '../driver-profile-reporting/cdk-detail-row.directive';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    DriverProfileReportingComponent,CdkDetailRowDirective
  ],
  imports: [
    CommonModule,
    DriverReportingRoutingModule,
      CommonModule,
      AdminFormsRoutingModule,
      SharedModule,
      MatTableModule,
      MatTabsModule,
      MatSortModule,
      MatPaginatorModule,
      MatSlideToggleModule,
      FileUploadModule,
      DropdownModule,
      CalendarModule

  ],
  providers: [
    ConnectionResolver
  ],
})
export class DriverReportingModule { }

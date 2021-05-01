import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
// import { GroupedVerticalBarChartComponent } from '../shared/grouped-vertical-bar-chart/grouped-vertical-bar-chart.component';
import { ConnectionResolver } from '../route.resolver';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { AuditFormComponent } from './auditForm.component';
import { AuditRoutingModule } from './auditForm-routing.module.';
import { FileUploadModule } from 'primeng/fileupload';
import { AuditDocumentComponent } from './audit-document/audit-document.component';
import { CdkDetailRowDirective } from './audit-document/cdk-detail-row.directive';
// import { CdkDetailRowDirective } from './templateform/cdk-detail-row.directive';

@NgModule({
  declarations: [
    AuditFormComponent,
    AuditDocumentComponent,
    CdkDetailRowDirective
    // GroupedVerticalBarChartComponent,
  ],
  imports: [
    CommonModule,
    AuditRoutingModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatPaginatorModule,
    SharedModule,
    FileUploadModule
  ],
  providers: [
    ConnectionResolver
  ],
})
export class AuditModule { }

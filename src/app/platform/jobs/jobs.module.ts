import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsRoutingModule } from './jobs-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TemplateformComponent } from './templateform/templateform.component';
import { ClientDropdownComponent } from '../shared/client-dropdown/client-dropdown.component';
import { ContractsDropdownComponent } from '../shared/contracts-dropdown/contracts-dropdown.component';
import { LocationDropdownComponent } from '../shared/location-dropdown/location-dropdown.component';
import { AreaDropdownComponent } from '../shared/area-dropdown/area-dropdown.component';
import { LabelLoaderComponent } from '../shared/label-loader/label-loader.component';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDetailRowDirective } from './templateform/cdk-detail-row.directive';

@NgModule({
  declarations: [
    TemplateformComponent,
    CdkDetailRowDirective,
    ClientDropdownComponent,
    ContractsDropdownComponent,
    LocationDropdownComponent,
    AreaDropdownComponent,
    LabelLoaderComponent
  ],
  imports: [
    CommonModule,
    JobsRoutingModule,
    SharedModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatPaginatorModule,
    MatSlideToggleModule,
  ]
})
export class JobsModule { }

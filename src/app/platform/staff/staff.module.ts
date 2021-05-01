import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DriverComponent } from './driver/driver.component';
import { DriversComponent } from './drivers/drivers.component';
import { ItemMetaInformationComponent } from '../item-meta-information/item-meta-information.component';
import { MapOverlayComponent } from '../map-overlay/map-overlay.component';
import { AdminFineFormComponent } from '../admin-fine-form/admin-fine-form.component';
import { StaffListingTableComponent } from './drivers/staff-listing-table/staff-listing-table.component';

@NgModule({
  declarations: [
    DriverComponent,
    DriversComponent,
    ItemMetaInformationComponent,
    MapOverlayComponent,
    AdminFineFormComponent,
    StaffListingTableComponent
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    SharedModule
  ]
})
export class StaffModule { }

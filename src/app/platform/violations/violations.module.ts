import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ViolationsRoutingModule } from './violations-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ViolationsComponent } from './violations/violations.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [
    ViolationsComponent
  ],
  imports: [
    CommonModule,
    ViolationsRoutingModule,
    SharedModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ]
})
export class ViolationsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerritoriesRoutingModule } from './territories-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TerritoriesComponent } from './territories/territories.component';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [
    TerritoriesComponent
  ],
  imports: [
    CommonModule,
    TerritoriesRoutingModule,
    SharedModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule
  ]
})
export class TerritoriesModule { }

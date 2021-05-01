import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractsRoutingModule } from './contracts-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ContractDashboardComponent } from './contract-dashboard/contract-dashboard.component';

@NgModule({
  declarations: [
    ContractDashboardComponent
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    SharedModule
  ]
})
export class ContractsModule { }

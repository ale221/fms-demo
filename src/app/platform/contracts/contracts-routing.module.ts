import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractDashboardComponent } from './contract-dashboard/contract-dashboard.component';

const routes: Routes = [
  { path: '', component: ContractDashboardComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractsRoutingModule { }

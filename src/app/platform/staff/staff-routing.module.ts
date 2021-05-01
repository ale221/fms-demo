import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriversComponent } from './drivers/drivers.component';
import { DriverComponent } from './driver/driver.component';

const routes: Routes = [
  { path: '', component: DriversComponent },
  { path: ':id', component: DriverComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }

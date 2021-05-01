import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViolationsComponent } from './violations/violations.component';

const routes: Routes = [
  { path: '', component: ViolationsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViolationsRoutingModule { }

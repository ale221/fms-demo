import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TerritoriesComponent } from './territories/territories.component';

const routes: Routes = [
  { path: '', component: TerritoriesComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerritoriesRoutingModule { }

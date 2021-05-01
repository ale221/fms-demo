import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateformComponent } from './templateform/templateform.component';

const routes: Routes = [
  { path: '', component: TemplateformComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobsRoutingModule { }

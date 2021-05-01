import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { ConnectionResolver } from '../route.resolver';

const routes: Routes = [
  { path: '', component: QuickViewComponent, resolve: { connection: ConnectionResolver } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlayBackRoutingModule { }

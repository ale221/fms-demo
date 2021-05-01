import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminCardFormComponent } from './admin-card-form/admin-card-form.component';
import { AdminGraphFormComponent } from './admin-graph-form/admin-graph-form.component';
import { AdminFuelFormComponent } from './admin-fuel-form/admin-fuel-form.component';
import { AdminTruckFormComponent } from './admin-truck-form/admin-truck-form.component';
import { AdminToolFormComponent } from './admin-tool-form/admin-tool-form.component';
import { AdminTerritoryFormComponent } from './admin-territory-form/admin-territory-form.component';
import { AdminUserFormComponent } from './admin-user-form/admin-user-form.component';
import { AdminClientFormComponent } from './admin-client-form/admin-client-form.component';
import { AdminContractFormComponent } from './admin-contract-form/admin-contract-form.component';
import { AdminDriverFormComponent } from './admin-driver-form/admin-driver-form.component';
import { AdminConfigFormComponent } from './admin-config-form/admin-config-form.component';
import { AdminPermissionsFormComponent } from './admin-permissions-form/admin-permissions-form.component';
import { AdminRouteComponent } from './admin-routes/admin-routes.component';
import { AdminConfigurationsComponent } from './admin-configurations/admin-configurations.component';
// import { DemoAppComponent } from './admin-test.component';
// import { TemplateformComponent } from '../jobs/templateform/templateform.component';

const routes: Routes = [
  {
    path: 'config',
    component: AdminConfigFormComponent
  },
  {
    path: 'fuel',
    component: AdminFuelFormComponent
  },
  {
    path: 'truck',
    component: AdminTruckFormComponent
  },
  {
    path: 'fleets',
    component: AdminTruckFormComponent
  },
  {
    path: 'tool',
    component: AdminToolFormComponent
  },
  {
    path: 'territory',
    component: AdminTerritoryFormComponent,
  },
  {
    path: 'staff',
    component: AdminDriverFormComponent,
  },
  {
    path: 'user',
    component: AdminUserFormComponent,
  },
  {
    path: 'permissions',
    component: AdminPermissionsFormComponent,
  },
  {
    path: 'route',
    component: AdminRouteComponent,
  },
  // {
  //   path: 'templates',
  //   component: TemplateformComponent,
  // },
  {
    path: 'customer',
    component: AdminClientFormComponent,
  },
  {
    path: 'contract',
    component: AdminContractFormComponent,
  },
  {
    path: 'card-setting',
    component: AdminCardFormComponent,
  },
  {
    path: 'graph-setting',
    component: AdminGraphFormComponent,
  },
  {
    path: 'configurations',
    component: AdminConfigurationsComponent
    // path: 'test',
    // component: DemoAppComponent,
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminFormsRoutingModule { }

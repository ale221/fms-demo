import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { CoreModule } from './core/core.module';
import { LoginComponent } from './core/login/login.component';
import { AuthGuardService as AuthGuard } from './Services/auth-guard';
import { AnonymousGuardService } from './core/services/anonymous-guard.service';

const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [AnonymousGuardService] },
  { path: 'iol', loadChildren: () => import('./platform/platform.module').then(m => m.PlatformModule) , canActivate: [AuthGuard] },
  { path        : '**', pathMatch   : 'full', component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'}),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

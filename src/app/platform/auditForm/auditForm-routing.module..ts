import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuditDocumentComponent } from './audit-document/audit-document.component';
import { AuditFormComponent } from './auditForm.component';


const routes: Routes = [
  {
    path: '', 
    component: AuditFormComponent,
  
  },
 
  {
    path:'document',
    component: AuditDocumentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuditRoutingModule { }

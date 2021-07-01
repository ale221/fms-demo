import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformRoutingModule } from './platform-routing.module';
import { DashboardComponent } from '../core/dashboard/dashboard.component';
import { HeaderComponent } from '../core/header/header.component';
import { SidebarComponent } from '../core/sidebar/sidebar.component';
import { FooterComponent } from '../core/footer/footer.component';
// import {GrowlModule} from 'primeng/growl';
import { ProgressBarModule, ProgressSpinnerModule } from 'primeng/primeng';
import { ConfirmDialogModule } from 'primeng/primeng';
import { SharedModule } from './shared/shared.module';
import { AngularFireModule } from 'angularfire2';
import { FireBaseService } from './services/firebase.service';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { IolDashboardComponent } from './iol-dashboard/iol-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NotificationsDashboardComponent } from './notifications-dashboard/notifications-dashboard.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { DriverSaftyReportingComponent } from './Reports/driver-safty-reporting/driver-safty-reporting.component';
import { HelppageComponent } from '../core/helppage/helppage.component';
import {DataViewModule} from 'primeng/dataview';
import { firebaseConfig } from 'src/environments/environment';

// export const firebaseConfig = {
//   apiKey: 'AIzaSyBsLwTsCPvk3yTakjF3TQUPmNhPXmW81ac',
//   authDomain: '',
//   databaseURL: 'https://courier-service-25adf.firebaseio.com/',
//   storageBucket: '',
//   messagingSenderId: '1084141469203',
//   projectId: 'courier-service-25adf'
// };


@NgModule({
  declarations: [
    DashboardComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    IolDashboardComponent,
    DriverSaftyReportingComponent,
    HelppageComponent,
    UserProfileComponent,
    NotificationsDashboardComponent,
  ],
  imports: [
    CommonModule,
    PlatformRoutingModule,
    // GrowlModule,
    DataViewModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    // ConfirmDialogModule,
    SharedModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  providers: [FireBaseService]
})

export class PlatformModule { }

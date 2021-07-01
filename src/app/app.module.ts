import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

import { AuthService } from './Services/auth.service';
import { DataSharingService } from './Services/data-sharing.service';
import { HttpService } from './Services/http.service';
import { AuthGuardService } from './Services/auth-guard';
import { InterceptorService } from './Services/interceptor.service';
import { LoginComponent } from './core/login/login.component';

import { FusionChartsModule } from "angular-fusioncharts";
import { AngularFireModule } from 'angularfire2';

// Import FusionCharts library and chart modules
import * as FusionCharts from "fusioncharts";
import * as charts from "fusioncharts/fusioncharts.charts";
import * as FusionTheme from "fusioncharts/themes/fusioncharts.theme.fusion";

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting
import { AngularFireAuthModule, AngularFireAuth } from "angularfire2/auth";
import { firebaseConfig } from 'src/environments/environment';

FusionChartsModule.fcRoot(FusionCharts, charts, FusionTheme);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    NgSelectModule,
    FormsModule,
    LoadingBarRouterModule,
    ReactiveFormsModule,
    FusionChartsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    ToastrModule.forRoot({
      positionClass :'toast-top-right'
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgIdleKeepaliveModule.forRoot(),
    MomentModule
  ],
  providers: [HttpService,
    AuthService,
    AuthGuardService,
    DataSharingService,
    AngularFireAuth,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayBackRoutingModule } from './play-back-routing.module';
import { QuickViewComponent } from './quick-view/quick-view.component';
import { SharedModule } from '../shared/shared.module';
import { ConnectionResolver } from '../route.resolver';
import { SignalRConfiguration, SignalRModule } from 'src/app/core/wfw-ngx-signalr';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlaybackGoogleMapComponent } from './playback-google-map/playback-google-map.component';

export function createConfig(): SignalRConfiguration {
  const c = new SignalRConfiguration();
  c.url = 'https://staging.broadcaster.iot.vodafone.com.qa'; //'http://reliance-signalr-hypernet.southeastasia.cloudapp.azure.com:8080/signalr';
  c.hubName = 'EventHubMessages';
  c.logging = false;
  c.withCredentials = true;
  return c;
}

@NgModule({
  declarations: [QuickViewComponent, PlaybackGoogleMapComponent],
  imports: [
    SignalRModule.forRoot(createConfig),
    CommonModule,
    PlayBackRoutingModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    SharedModule,
    OverlayModule
  ],
  providers: [
    ConnectionResolver
  ]
})
export class PlayBackModule { }

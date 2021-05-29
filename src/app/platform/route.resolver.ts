import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';
import { ISignalRConnection, SignalR } from '../core/wfw-ngx-signalr';

@Injectable()
export class ConnectionResolver implements Resolve<ISignalRConnection> {

  constructor(private _signalR: SignalR) {
  }

  resolve(): any {
    // console.log('ConnectionResolver. Resolving...');
    // try {
    //   return this._signalR.connect();
    // } catch (err) {
    //   // console.log('Error in _signalR.connect: ' + err.message);
    // }
    return this._signalR.createConnection();
    // // console.log('connection', obj);
    // if(obj['__zone_symbol__state']) { return obj; }
    // else return null;
    // this._signalR.connect()
    //   .then((c) => {
    //     // console.log('success', c);
    //     return this._signalR.connect();
    //   })
    //   .catch((err) => {
    //     // console.log('error', err);
    //     return null;      });
  }
}

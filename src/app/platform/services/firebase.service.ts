import { Inject, Injectable } from "@angular/core";
import { FirebaseApp } from "angularfire2";
import * as firebase from 'firebase';

@Injectable()
export class FireBaseService {

    private _messaging: firebase.messaging.Messaging;

    constructor(@Inject(FirebaseApp) private _firebaseApp: firebase.app.App) {

        this._messaging = firebase.messaging(this._firebaseApp);
        this._messaging.requestPermission()
            .then((result) => { 
                console.log(result)
            })
            .catch((error) => { 
                console.log(error)
             });
    }
}
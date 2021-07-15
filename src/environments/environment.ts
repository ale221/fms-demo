// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // baseUrl: 'http://52.157.78.199:8080',
  // baseUrl: 'http://51.124.10.14:8080',
  // baseUrl:'http://dev.iot.vodafone.com.qa:8080',
  baseUrl:'https://staging.iot.vodafone.com.qa/m',
  // sanpToRoadUrl: 'https://roads.googleapis.com/'
  sanpToRoadUrl: 'https://staging.iot.vodafone.com.qa:5000/match/v1/driving/',
  translateUrl: '/assets/i18n/',
  signalR: 'https://staging.broadcaster.iot.vodafone.com.qa'
};

// export const firebaseConfig = {
//   apiKey: "AIzaSyDoU99niU2pHgMubeK_sG8XId-3LF4NhRI",
//   authDomain: "vodafone-platform.firebaseapp.com",
//   databaseURL: "https://vodafone-platform-default-rtdb.firebaseio.com",
//   projectId: "vodafone-platform",
//   storageBucket: "vodafone-platform.appspot.com",
//   messagingSenderId: "1035844674036",
//   appId: "1:1035844674036:web:849a59202d75378f60d9a1",
//   measurementId: "G-HFSXDQGLBN"
// };

export const firebaseConfig = {
  apiKey: "AIzaSyCMYNLiXRHckfrihsuEO-ISo6P6vNWpU-U",
  authDomain: "vfq-iot.firebaseapp.com",
  databaseURL: "https://vfq-iot-default-rtdb.firebaseio.com",
  projectId: "vfq-iot",
  storageBucket: "vfq-iot.appspot.com",
  messagingSenderId: "302255213163",
  appId: "1:302255213163:web:239a454b377e2e1ce1bf2e",
  measurementId: "G-541W0BSB8K"
};





/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

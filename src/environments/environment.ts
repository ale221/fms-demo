// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // baseUrl: 'http://52.157.78.199:8080',
  // baseUrl: 'http://51.124.10.14:8080',
  // baseUrl:'http://dev.iot.vodafone.com.qa:8080',
  baseUrl:'https://staging.iot.vodafone.com.qa/m', //dev //backend
  // sanpToRoadUrl: 'https://roads.googleapis.com/'
  sanpToRoadUrl: 'https://staging.iot.vodafone.com.qa:5000/match/v1/driving/', //dev
  translateUrl: '/assets/i18n/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

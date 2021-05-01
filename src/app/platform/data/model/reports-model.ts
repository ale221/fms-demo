import {isNullOrUndefined} from "util";

export class ReportsData {
  private static obj = {
    'Speed': { 'marker': 'assets/images/iol/icon-map-violation-speed.png'},
    'Default': { 'marker': 'assets/images/iol/icon-map-violation.png'},
  };
  static getViolationMarkerIcon(type?: string) {
   return isNullOrUndefined(type) || !ReportsData.obj.hasOwnProperty(type)? ReportsData.obj['Default'] : ReportsData.obj[type];
  }

}

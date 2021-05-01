// Created by soban on 09-08-2017.

import {SignalRresponse} from './signalRresponse';
import {CalibrationResponse} from '../data/response/calibration-response';

export class EntityResponse {
  assigned_jobs = [];
  assigned_territory = [];
  assigned_bins = [];
  assigned_truck: any;
  id: number;
  name: string;
  device_id: string;
  type: number;
  customer: string;
  status: any;
  modified_by: string;
  created_datetime: string;
  modified_datetime: string;
  end_datetime?: any;
  assignments: number;
  last_updated: string;
  last_volume: number;
  last_latitude?: number;
  last_longitude?: number;
  address: string;
  signalRresponse: SignalRresponse = new SignalRresponse(null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  total_maintenances: number;
  total_violations: number;
  total_jobs_completed: number;
  online_status: boolean;
  last_decantation: string;


  // Truck props
  total_distance: number;
  tdist_last24Hrs: number;
  tvol_last24Hrs: number;
  last_speed: number = 0;
  last_temperature: number = 0;
  last_density: number = 0;
  total_fillups: number;
  territory_type_id: number;

  calibrationResponse: CalibrationResponse;

  getLastUpdated() {
    if (this.signalRresponse && this.signalRresponse.t_timestamp) {
      return this.signalRresponse.t_timestamp;
    }
    return this.last_updated;
  }
}


export class SiteResponse {
  assigned_jobs = [];
  assigned_territory = [];
  description: string;
}

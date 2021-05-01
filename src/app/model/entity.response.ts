/**
 * Created by Amnah on
 */

import { SignalRresponse } from '../platform/model/signalRresponse';
import { CalibrationResponse } from '../platform/data/response/calibration-response';

export class EntityResponse {
  id: number;
  name: string;
  device_id: string;
  type: number;
  customer: string;
  status: string;
  modified_by: string;
  created_datetime: string;
  modified_datetime: string;
  end_datetime: string;
  assignments: number;
  last_updated: string;
  last_volume: number;
  last_latitude?: number;
  last_longitude?: number;
  address: string;
  signalRresponse: SignalRresponse = new SignalRresponse(null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  total_maintenances: number;
  total_violations: number;
  online_status: boolean;
  last_decantation: string;


  // Truck props
  total_distance: number;
  tdist_last24Hrs: number;
  tvol_last24Hrs: number;
  last_speed: number;
  last_temperature: number;
  last_density: number;
  total_fillups: number;

  calibrationResponse: CalibrationResponse;

  getLastUpdated() {
    if (this.signalRresponse && this.signalRresponse.t_timestamp) {
      return this.signalRresponse.t_timestamp;
    }
    return this.last_updated;
  }
}

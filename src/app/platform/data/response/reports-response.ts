
export class MaintenanceResponse {
  type: string;
  driver: string;
  driver_id: number;
  date_time: string;
  start_lat_lng: any;
  end_lat_lng: any;
  maintenance_type_name: any;
  status_label: any;
  driver_name: any;
  start_datetime: any;
  end_datetime: any;
  issued_datetime: any;

}
export class FillupResponse {

  lat: string;
  long: string;
  post_volume: string;
  pre_volume: string;
  timestamp: string;
  fuel_filled: any;
  fuel_avg: string;
  distance_travelled: string;
  volume_consumed: string;
}
export class DecantationResponse {

  post_volume: string;
  pre_volume: string;
  timestamp: string;
  volume_decant: any;
}
export class ViolationResponse {
  date: any;
  driver_assigned: string;
  entity_id: number;
  job_assigned: string;
  lat: any;
  long: any;
  threshold_violation: any;
  type: any;
  violation_value:any;

}

interface territoryResponse {
  territory_id: number;
  territory_name: string;
  territory_location: any;
}

export class SnapshotResponse {
  assigned_driver: any = null;
  details_of_job: any = null;
  truck_name: string = null;
  lat : string = null;
  long : string = null;
  speed : number = 0;
  temperature: any = 0;
  territory: territoryResponse[];
  timestamp: string;
  volume: any;
  weight: any;
  vehicle_state: string;
}

export class MaintenanceDataResponse {
  type: string;
  driver: string;
  driver_id: number;
  truck: string;
  truck_id: number;
  action: number;
  action_label: string;
  cost: number;
  cost_type: number;
  cost_type_label: string;
  timestamp: string;
  notes: string;

}

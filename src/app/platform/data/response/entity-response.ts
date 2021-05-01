import { EntityResponse } from 'src/app/platform/model/entity.response';

export class TruckResponse extends EntityResponse {
  image: any;
  speed: boolean;
  temperature: boolean;
  volume: boolean;
  density: boolean;
  location: boolean;
  ob2_complaint: boolean;
  make: string;
  squad_number: any;
  model: string;
  year: string;
  engine_capacity: string;
  chassis_number: any;
  odo_reading: any;
  entity_sub_type_name: any;
  total_jobs_completed: any;
  last_fillup: any;
  source_latlong: any;
  device: any;
  entity_sub_type: any;
  status_label: any;
  date_commissioned: any;
  volume_capacity: any;
  registration: any;
  wheels: any;
  assigned_driver: any;
  status_id: any;
  threshold_value: any;
  vol: any;
  engine_number: any;
}

export class JobResponse extends EntityResponse {

  actual_job_end_timestamp: any;
  actual_job_start_timestamp: string;
  assigned_driver: { id: number, name: string } = {id: null, name: ''};
  assigned_truck: { id: number, name: string } = {id: null, name: ''};
  entity_id: any;
  job_distance: any;
  job_duration: any;
  job_details: any;
  job_end_lat_long: any;
  job_end_timestamp: any;
  job_start_datetime: any;
  job_end_datetime: any;
  job_start_lat_long: any;
  job_start_timestamp: any;
  job_status_id: number;
  job_status: string;
  job_fillups: any[] = [];
  job_violations: any[] = [];
  job_volume_consumed: any;
  name: any;
  notes: any;
  notification_sent: any;
  person_id: any;
  timestamp: any;
}

export class BinResponse extends EntityResponse {
  id: number;
  name: string;
  type: number;
  status: number;
  status_label: string;
  module: number;
  module_name: string;
  modified_by_name: string;
  modified_by_email: string;
  created_datetime: string;
  modified_datetime: string;
  end_datetime?: any;
  assignments: number;
  device_name?: any;
  device_name_method?: any;
  volume: boolean;
  source_latlong: string;
  skip_size: number;
  skip_size_name: string;
  entity_sub_type: number;
  entity_sub_type_name: string;
  client_name: string;
  client: number;
  obd2_compliant: boolean;
  operational: boolean;
  leased_owned: number;
  leased_owned_name: string;
  maintenance_status: string;
  day_preference?: any;
  frequency?: any;
  dimension?: any;
  dimension_label?: any;
  assigned_contract: string;
  assigned_contract_id: number;
  assigned_contract_type: string;
  skip_rate: number;
  party_code: string;
  assigned_area: string;
  assigned_area_id: number;
  assigned_location: string;
  assigned_location_id: number;
  last_collection?: any;
  activity_status?: any;
  current_activity?: any;
  old_contract?: any;
  old_contract_type?: any;
  old_area?: any;
  old_location?: any;
  old_client?: any;
  old_client_party_code?: any;
  next_collection?: any;
  assigned_template_id?: any;

}

export class DriverResponse extends EntityResponse {
  assigned_truck: any;
  truck: any;
  assigned_truck_id: any;
  on_shift: any;
  cnic: string;
  salary: any;
  marital_status: string;
  marital_status_id: string;
  gender: string;
  gender_id: string;
  performance_rating: string;
  photo: any;
  dob: any;
  age: any;
  shift_status: any;
  date_of_joining: any;
  photo_method: any;
  type_name: any;
  type: any;


}

export class maintenanceSummaryResponse {

  engine_tuning: number;
  service_maintenance: number;
  suspension_repair_replacement: number;
  tyre_replacement: number;

  over_due: number;
  completed: number;
  due_maintenance: number;
}





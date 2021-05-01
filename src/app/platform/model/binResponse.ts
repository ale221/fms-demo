import {EntityResponse} from './entity.response';

export class BinResponse extends EntityResponse {
  source_address;
  source_latlong;
  assigned_contract;
  assigned_area;
  last_collection;
  obd2_compliant;
  operational: boolean;

}




// Created by soban on 09-08-2017.

import {Item} from './item';

export class AppLocation {
  entity_id: number;
  entity_name: number; // added for new job flow
  latitude: number;
  longitude: number;
  last_latitude: number;
  last_longitude: number;
  infoList: Item[] = [];

  constructor(entity_id, latitude, longitude, infoList?, last_latitude?, last_longitude?, entity_name?) {
    this.entity_id = entity_id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.infoList = infoList;
    this.last_longitude = last_latitude;
    this.last_longitude = last_longitude;
    this.entity_name = entity_name;
  }
}

export class EntityWithIconLocation {
  entity_id: number;
  latitude: number;
  longitude: number;
  infoList: Item[] = [];
  iconUrl:any;
  last_latitude: number;
  last_longitude: number;
  entity_name: number; // added for new job flow
  skip_size: any;
  flag = false;
  constructor(entity_id, latitude, longitude, infoList?, iconUrl?, last_latitude?, last_longitude?, entity_name?, skip_size?) {
    this.entity_id = entity_id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.infoList = infoList;
    this.iconUrl = iconUrl;
    this.last_longitude =last_longitude;
    this.last_latitude = last_latitude;
    this.entity_name =entity_name;
    this.skip_size = skip_size;
    this.flag = false;
  }
}
export class TrailMarkerResponse {
  lat: number;
  long: number;
  speed: number;
  volume: number;
  timestamp: string;
}

export class VehicleSummaryResponse {
  volume_consumed: any;
  distance_travelled: number;
  activities_completed: number;
}

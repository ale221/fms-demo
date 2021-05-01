// Created by soban on 09-08-2017.

import {AppConfig} from '../../app.config';
import {isValid} from 'date-fns';
import {until} from 'selenium-webdriver';
import elementIsSelected = until.elementIsSelected;
import {isNull, isNullOrUndefined} from 'util';

export class SignalRresponse {
  compartments: any[];
  customer: number;
  f_density: number;
  f_temperature: number;
  f_volume: number;
  id: string;
  latitude: number;
  longitude: number;
  module: number;
  speed: number;
  t_timestamp: string;
  type: number;

  comp: any[];
  dens: number;
  temp: number;
  vol: any;
  lat: number;
  lon: number;
  lng: number;
  spd: number;
  rtp: number;
  t: any;
  nw: any;
  gw: any;
  d: any;
  mss: any;

  constructor(compartments: any[],
              customer: number,
              f_density: any,
              f_temperature: any,
              f_volume: any,
              id: string, latitude: number,
              longitude: number,
              module: number,
              speed: any,
              rtp: number,
              t_timestamp: string,
              type: number,
              nw = 1,
              gw = 1,
              d = null,
              mss = null
  ) {
    this.compartments = compartments;
    this.customer = customer;
    // if(d)
    // this.d = d;
    // if(mss)
    //   this.mss = mss;
    this.id = id;
    if (f_density != null) {
      this.f_density = parseFloat((parseFloat(f_density).toFixed(AppConfig.NUMBER_PRECISION)));
      this.dens = parseFloat((parseFloat(f_density).toFixed(AppConfig.NUMBER_PRECISION)));
    }
    if (f_temperature != null) {
      this.f_temperature = parseFloat(parseFloat(f_temperature).toFixed(AppConfig.NUMBER_PRECISION));
      this.temp = parseFloat(parseFloat(f_temperature).toFixed(AppConfig.NUMBER_PRECISION));
    }
    if (f_volume != null) {
      this.f_volume = parseFloat(parseFloat(f_volume).toFixed(AppConfig.NUMBER_PRECISION));
      this.vol = parseFloat(parseFloat(f_volume).toFixed(AppConfig.NUMBER_PRECISION));
    }
    if (latitude != null) {
      this.latitude = latitude;
      this.lat = latitude;
    }
    if (longitude != null) {
      this.longitude = longitude;
      this.lon = longitude;
      this.lng = longitude;
    }
    this.module = module;
    if (speed != null) {
      this.speed = parseFloat(parseFloat(speed).toFixed(AppConfig.NUMBER_PRECISION));
      this.spd = parseFloat(parseFloat(speed).toFixed(AppConfig.NUMBER_PRECISION));
    }
    if (t_timestamp != null) {
      const newDate = new Date(t_timestamp);
      if (isValid(newDate)) {
        this.t_timestamp = t_timestamp;
        this.t = newDate;
      }
    }
    this.type = type;
    if (+nw < +gw) {
      this.nw = +nw;
      this.gw = +gw;
    } else {
      this.nw = +gw;
      this.gw = +nw;
    }

    if (this.nw > 4000000) {
      this.nw = Math.pow(2, 32) - this.nw;
    }

    if (this.gw > 4000000) {
      this.gw = Math.pow(2, 32) - this.gw;
    }
    this.d = d;
    this.mss = mss;


  }
}

export class EmployeeSignalRresponse {
  active_score: number;
  customer: number;
  dens: number;
  duration: number;
  gw: number;
  heartrate_value: number;
  id: string;
  inactive_score: number;
  lat: number;
  lon: number;
  module: number;
  nw: number;
  spd: number;
  t: string;
  temp: number;
  trip: boolean;
  type: number;
  vol: number;


  constructor(active_score: number,
              customer: number,
              dens: number,
              duration: number,
              gw: number,
              heartrate_value: number,
              id: string,
              inactive_score: number,
              lat: number,
              lon: number,
              module: number,
              nw: number,
              spd: number,
              t: string,
              temp: number,
              trip: boolean,
              type: number,
              vol: number) {

    this.active_score = active_score;
    this.customer = customer;
    this.dens = dens;
    this.duration = duration;
    this.gw = gw;
    this.heartrate_value = heartrate_value;
    this.id = id;
    this.inactive_score = inactive_score;
    this.lat = lat;
    this.lon = lon;
    this.module = module;
    this.nw = nw;
    this.spd = spd;
    this.t = t;
    this.temp = temp;
    this.trip = trip;
    this.type = type;
    this.vol = vol;

  }


}






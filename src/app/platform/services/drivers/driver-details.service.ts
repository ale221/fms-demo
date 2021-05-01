import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginApiResponse } from '../../../core/model/api.response';

@Injectable({
  providedIn: 'root'
})
export class DriverDetailsService {

  constructor(public http: HttpClient) {
  }


  getDriversData(params?): Observable<LoginApiResponse<any[]>> {
    const url = `/iof/get_drivers_list`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }

  getShiftData(params?): Observable<LoginApiResponse<any[]>> {
    const url = `/iof/shift_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }

  getFineData(params?): Observable<LoginApiResponse<any[]>> {
    const url = `/iof/fine_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }
  getDriverProfile(params?){
    const url = `/iof/driver_profile_report/?${params}`;
    return this.http.get(url);

  }
  getDriverDetailId(params){
    // const url = `/iof/get_driver_group/?group_id=${driverGroupID}`;
    // const url= '/api/users/driver_dashboard/'+driverGroupID +'/';
    const url= `/api/users/driver_dashboard/?${params}`;
    return this.http.get(url);
  }
  getDriver(driverGroupID){
    const url = `/iof/get_driver_group/?group_id=${driverGroupID}`;
    return this.http.get(url);
  }
  getFleet(driverGroupID){
    const url = `/iof/fleet/${driverGroupID}`;
    return this.http.get(url);
  }
  getFleetNew(driverGroupID){
    const url = `/iof/filtered_vehicles/?fleet_id=${driverGroupID}`;
    return this.http.get(url);
  }
  getDriverGroup(){
    const url = `/hypernet/get_driver_group/`;
    return this.http.get(url);
  }
  getFleetGroup(){
    const url = `/iof/get_fleets/`;
    return this.http.get(url);
  }
  getVehicleShift(){
    const url = `/iof/shiftvehicle`;
    return this.http.get(url);
  }
  getVehicleDrivertoVehicleAllocation(){
    const url = `/hypernet/entity/get_unassigned_trucks/`;
    return this.http.get(url);
  }
  // getExportData(){
  //   const url = `/iof/driver_profile_report/?is_export=yes`;
  //   return this.http.get(url);

  // }
  getDriverForGroupAdd()
  {
    // hypernet/get_unassigned_driver
    const url = `/hypernet/get_unassigned_driver`;
    return this.http.post(url,{});
  }
  getDriverReportClass(){

    const url = `/iof/get_report_type/`;
    return this.http.get(url);
  }
  getReportType(id?){
    const url = `/iof/get_report_sub_type/?id=${id}`;
    return this.http.get(url);
  }
  getTableHeader(){
    const url = `/iof/get_report_sub_type/`;
    return this.http.get(url);
  }
  getByReportsId(params?){
    const url = `/iof/get_multi_report/?${params}`;
    return this.http.get(url);

  }
  getExtendedtable(params?){
    const url = `/iof/driver_incident_records/?${params}`;
    return this.http.get(url);

  }


}

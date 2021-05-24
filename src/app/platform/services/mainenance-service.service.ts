import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, LoginApiResponse } from '../../core/model/api.response';
import { ViolationResponse } from '../data/response/reports-response';
import { maintenanceSummaryResponse } from '../data/response/entity-response';
import { EntityType } from '../../core/enum/entity-type.enum';
import { JobStatusEnum, MaintenanceStatusEnum } from '../enum/iol-entity.enum';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  constructor(public http: HttpClient, public authService: AuthService) {
  }

  postMaintenance(params) {
    const url = `${'/hypernet/entity/maintenances/maintenance'}`;
    return this.http.post(url, params);
  }

  patchMaintenance(params) {
    const url = `${'/hypernet/entity/maintenances/maintenance'}`;
    return this.http.patch(url, params);
  }

  getMaintenanceInfo(params?): Observable<ApiResponse<maintenanceSummaryResponse>> {
    const url = `/iof/get_maintenance_summary`;
    return this.http.get<ApiResponse<maintenanceSummaryResponse>>(url, { params: params });
  }

  getMaintenanceData(params?): Observable<LoginApiResponse<any>> {
    const url = `/iof/maintenance_data_of_entity`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }

  getMaintenances(params?): Observable<LoginApiResponse<any>> {
    const url = `/iof/maintenance_of_entity`;
    return this.http.post<LoginApiResponse<any>>(url, params);
  }

  getIoPDevices(params?) {
    const url = `/iop/get_iop_devices_count/`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }

  postMaintenanceData(params) {
    const url = `${'/hypernet/entity/maintenances/add_maintenance_data'}`;
    return this.http.post(url, params);
  }

  getClass(status) {
    if (status === MaintenanceStatusEnum.MAINTENANCE_OVER_DUE) {
      return 'label-danger';
    } else if (status === MaintenanceStatusEnum.MAINTENANCE_PENDING) {
      return 'label-info';
    } else if (status === MaintenanceStatusEnum.MAINTENANCE_DUE) {
      return 'bg-yellow-800';
    } else if (status === MaintenanceStatusEnum.MAINTENANCE_COMPLETED) {
      return 'label-success';
    } else if (status === MaintenanceStatusEnum.ADDITION_OF_COST) {
      return 'bg-orange-500';
    } else if (status === MaintenanceStatusEnum.MAINTENANCE_WAITING_FOR_PARTS) {
      return 'bg-purple-800';
    } else {
      return 'bg-teal-600';
    }

  }

  getMaintenanceStats(params) {
    const url = `/iof/maintenance_stats`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }

  getServiceType() {
    // const url = `/iof/service-types`;
    const url = `/iof/maintenance-types-previous`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getTechnicianListing() {
    const url = `/iof/technicians`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getVehicleListing() {
    // let params = { 'customer': String(this.authService.getUser().customer.id) };
    const url = `/iof/vehicles`;
    return this.http.get<LoginApiResponse<any>>(url); //, { params: params }s
  }

  getFleetListing() {
    // let params = { 'customer': String(this.authService.getUser().customer.id) };
    const url = `/iof/fleet`;
    return this.http.get<LoginApiResponse<any>>(url); //, { params: params }s
  }

  getDrivers() {
    // let params = { 'customer': String(this.authService.getUser().customer.id) };
    const url = `/iof/drivers`;
    return this.http.get<LoginApiResponse<any>>(url);  //, { params: params }
  }

  getMaintanceStatus() {
    const url = `/iof/maintenance-status`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getMaintanceDashboardCards() {
    const url = `/iof/cards`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getMaintanceData(params) {
    const url = `/iof/maintenance/records?${params}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getMaintanceType(params) {
    const url = `/iof/maintenance-types?${params}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  postMaintanceTypeData(params) {
    let newData = this.converToFormdata(params);
    const url = '/iof/maintenance-types';
    return this.http.post(url, newData);
  }

  patchMaintanceTypeData(params) {
    let newData = this.converToFormdata(params);
    const url = '/iof/maintenance-types';
    return this.http.patch(url, newData);
  }

  getMaintanceSummary(params) {
    const url = `/iof/maintenance-summary/` + params;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getMaintanceTypeCategory(params) {
    const url = `/iof/maintenance-categories/` + params;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  postMaintanceData(params) {
    let newData = this.converToFormdata(params);
    const url = '/iof/maintenance';
    return this.http.post(url, newData);
  }

  patchMaintanceData(params) {
    let newData = this.converToFormdata(params);
    const url = '/iof/maintenance';
    return this.http.patch(url, newData);
  }

  deleteMaintenace(params) {
    console.log("params", params)
    // let newData2 = this.converToFormdata(params);
    const url = `/iof/maintenance/${params}`;
    return this.http.delete(url);
    // return this.http.delete(url, newData2);
  }

  deleteMaintenaceType(params) {
    console.log("params", params)
    const url = `/iof/maintenance-types/${params}`;
    return this.http.delete(url);
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return form_data;
  }

  getCardsForPredictiveMaintenance() {
    const url = `/iof/predictive-maintenance-cards`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getEfficiencyTableData(params) {
    const url = `/iof/predictive-maintenance-efficiency-table`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getEfficiencyTableDataWithID(params) {
    const url = `/iof/predictive-maintenance-efficiency-table?fleet_id=${params}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }


  getDataForMaintenancePredictive() {
    const url = `/iof/predictive-maintenance-monthly-prediction-chart`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getUpcomingMaintenances(params) {
    const url = `/iof/predictive-maintenance-upcoming-chart?id=${params}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }

  getVehicleOperationalEfficiencyChart(fleet, efficiency) {
    const url = `/iof/predictive-maintenance-efficiency-chart?fleet_id=${fleet}&is_efficient=${efficiency}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }


  // download PDF and Excel APIS
  downloadXLS(param): Observable<Blob> {
    const url = `/iof/maintenance/records?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }


  downloadPDF(param): Observable<Blob> {
    const url = `/iof/maintenance/records?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

}

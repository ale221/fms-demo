import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, LoginApiResponse } from '../../core/model/api.response';
import { EntityResponse } from '../model/entity.response';
import { AppConfig } from '../../app.config';
import { NgxChartResponse } from '../data/model/ngx-chart-response';
import { EntitySummaryResponse } from '../data/response/EntitySummaryResponse';
import { ZoomingGraphResponse } from '../data/response/zooming-graph-response';
import { CalibrationResponse } from '../data/response/calibration-response';
import { ZoomingGraphNewResponse } from '../data/response/zooming-graph-new-response';
import { DropDownItem } from '../data/model/dropdown-item';
import { ViolationResponse } from '../data/response/reports-response';
import { TrailMarkerResponse } from '../data/model/location';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor(public http: HttpClient) {
  }

  getEntities(params: any): Observable<LoginApiResponse<EntityResponse[]>> {
    const url = `/iof/entities`;
    return this.http.get<LoginApiResponse<EntityResponse[]>>(url, { params: params }).pipe(map((item) => {
      if ('response' in item) {
        item.response.forEach((e, i) => {
          item.response[i].tdist_last24Hrs = Number.parseFloat(((item.response[i].tdist_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
          item.response[i].tvol_last24Hrs = Number.parseFloat(((item.response[i].tvol_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
          item.response[i].created_datetime = DateUtils.getLocalYYYYMMDDHHmmss(e.created_datetime);
          item.response[i].modified_datetime = DateUtils.getLocalYYYYMMDDHHmmss(e.modified_datetime);
          item.response[i].end_datetime = DateUtils.getLocalYYYYMMDDHHmmss(e.end_datetime);
          item.response[i].last_updated = DateUtils.getLocalYYYYMMDDHHmmss(e.last_updated);
        });
      }
      return item;
    }));
  }

  // TODO: - commented out tvol_last24Hrs rounding off here. It will be in % value & needs to be corrected out in component being used.

  getEntity(id, params?: any): Observable<LoginApiResponse<EntityResponse>> {
    const url = `/iof/entities/${id}`;
    return this.http.get<LoginApiResponse<EntityResponse>>(url, { params: params }).pipe(map((item) => {
      item.response.total_distance = Number.parseFloat(((item.response.total_distance || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.tdist_last24Hrs = Number.parseFloat(((item.response.tdist_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      // item.response.tvol_last24Hrs = Number.parseFloat(((item.response.tvol_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.last_temperature = Number.parseFloat((item.response.last_temperature || 0).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.created_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.created_datetime);
      item.response.modified_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.modified_datetime);
      item.response.end_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.end_datetime);
      item.response.last_updated = DateUtils.getLocalYYYYMMDDHHmmss(item.response.last_updated);
      return item;
    }));
  }


  getFleetDetailById(id, params?: any): Observable<LoginApiResponse<EntityResponse>> {
    const url = `/iof/vehicle?id=${id}`;
    return this.http.get<LoginApiResponse<EntityResponse>>(url, { params: params }).pipe(map((item) => {
      // item.response.total_distance = Number.parseFloat(((item.response.total_distance || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      // item.response.tdist_last24Hrs = Number.parseFloat(((item.response.tdist_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      // item.response.tvol_last24Hrs = Number.parseFloat(((item.response.tvol_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      // item.response.last_temperature = Number.parseFloat((item.response.last_temperature || 0).toFixed(AppConfig.NUMBER_PRECISION));
      // item.response.created_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.created_datetime);
      // item.response.modified_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.modified_datetime);
      // item.response.end_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.end_datetime);
      // item.response.last_updated = DateUtils.getLocalYYYYMMDDHHmmss(item.response.last_updated);
      return item;
    }));
  }

  getFuelEntity(id, params?: any): Observable<LoginApiResponse<EntityResponse>> {
    const url = `/iof/fuel_dashboard_reporting?truck_id=${id}`;

    // fuel_dashboard_reporting?truck_id=10416

    return this.http.get<LoginApiResponse<EntityResponse>>(url, { params: params }).pipe(map((item) => {
      return item;
    }));
  }


  getClient(id, params?: any): Observable<LoginApiResponse<EntityResponse>> {
    const url = `/iof/client/${id}`;
    return this.http.get<LoginApiResponse<EntityResponse>>(url, { params: params }).pipe(map((item) => {
      item.response.total_distance = Number.parseFloat(((item.response.total_distance || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.tdist_last24Hrs = Number.parseFloat(((item.response.tdist_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.tvol_last24Hrs = Number.parseFloat(((item.response.tvol_last24Hrs || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.last_temperature = Number.parseFloat((item.response.last_temperature || 0).toFixed(AppConfig.NUMBER_PRECISION));
      item.response.created_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.created_datetime);
      item.response.modified_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.modified_datetime);
      item.response.end_datetime = DateUtils.getLocalYYYYMMDDHHmmss(item.response.end_datetime);
      item.response.last_updated = DateUtils.getLocalYYYYMMDDHHmmss(item.response.last_updated);
      return item;
    }));
  }

  getEntitySummary(params: any): Observable<LoginApiResponse<EntitySummaryResponse>> {
    const url = `/iof/entities_summary`;
    return this.http.get<LoginApiResponse<EntitySummaryResponse>>(url, { params: params }).pipe(map((item) => {
      if ('response' in item) {
        item.response.total_distance_travelled = Number.parseFloat(((item.response.total_distance_travelled || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
        item.response.total_volume_consumed = Number.parseFloat(((item.response.total_volume_consumed || 0) / 1000).toFixed(AppConfig.NUMBER_PRECISION));
      }
      return item;
    }));
  }

  getMapTrail(params?: any): Observable<LoginApiResponse<TrailMarkerResponse[]>> {
    const url = `/iof/map_trail`;
    return this.http.get<LoginApiResponse<TrailMarkerResponse[]>>(url, { params: params });
  }

  getEntityDrillReport(params: any): Observable<ApiResponse<NgxChartResponse[]>> {
    const url = `/iof/drill_report`;
    return this.http.get<ApiResponse<NgxChartResponse[]>>(url, { params: params });
  }

  getZoomReport(params: any): Observable<ApiResponse<ZoomingGraphResponse>> {
    const url = `/iof/zooming_report`;
    return this.http.get<ApiResponse<ZoomingGraphResponse>>(url, { params: params }).pipe(map((item) => {
      if (item.response.data_set.length > 0) {
        item.response.data_set.forEach((e, i) => {
          if (item.response.data_set[i].data.length > 0) {
            item.response.data_set[i].data.forEach((data, j) => {
              item.response.data_set[i].data[j][0] = DateUtils.getUTCtoLocalTimestamp(item.response.data_set[i].data[j][0]);
            });
          }
        });
      }
      return item;
    }));
  }

  getZoomReportNew(params: any): Observable<ApiResponse<ZoomingGraphNewResponse[]>> {
    const url = `/iof/zooming_report_new`;
    return this.http.get<ApiResponse<ZoomingGraphNewResponse[]>>(url, { params: params }).pipe(map((item) => {
      if (item.response.length > 0) {
        item.response.forEach((e, i) => {
          item.response[i].time = DateUtils.getLocalYYYYMMDDHHmmss(DateUtils.getUTCYYYYMMDDHHmmss(item.response[i].time));
          //   }
        });
      }
      return item;
    }));
  }

  getEntityCalibration(id, params?: any): Observable<ApiResponse<CalibrationResponse>> {
    const url = `/iof/entity_calibration/${id}`;
    return this.http.get<ApiResponse<CalibrationResponse>>(url, { params: params });
  }

  getCustomerDevicesFuel(params?: any): Observable<LoginApiResponse<DropDownItem[]>> {
    const url = `/iof/get_driver_voliation/`;
    return this.http.get<LoginApiResponse<DropDownItem[]>>(url, { params: params }).pipe(map((item) => {
      item.response.forEach((e, i) => {
        item.response[i] = new DropDownItem(item.response[i]['id'], item.response[i]['name']);
      });
      return item;
    }));
  }
  getCustomerDevicesFuelFilup(params?: any): Observable<LoginApiResponse<DropDownItem[]>> {
    const url = `/iof/dropdown_vehicle_fuelfilup/`;
    return this.http.get<LoginApiResponse<DropDownItem[]>>(url, { params: params }).pipe(map((item) => {
      item.response.forEach((e, i) => {
        item.response[i] = new DropDownItem(item.response[i]['id'], item.response[i]['name']);
      });
      return item;
    }));
  }
  // get_driver_voliation
  // getCustomerDevices(params?: any): Observable<LoginApiResponse<DropDownItem[]>> {
  //   const url = `/hypernet/entity/get_devices_dropdown/`;
  //   return this.http.get<LoginApiResponse<DropDownItem[]>>(url, { params: params }).pipe(map((item) => {
  //     item.response.forEach((e, i) => {
  //       item.response[i] = new DropDownItem(item.response[i]['device'], item.response[i]['device_name']);
  //     });
  //     return item;
  //   }));
  // }

  getCustomerDevices(params?: any): Observable<LoginApiResponse<any>> {
    const url = `/hypernet/entity/get_devices_dropdown/`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }


  getViolationsReport(params?: any): Observable<LoginApiResponse<ViolationResponse[]>> {
    const url = `/iof/get_violations_list`;
    return this.http.get<LoginApiResponse<ViolationResponse[]>>(url, { params: params });
  }

  getIgnotionReport(params?: any): Observable<LoginApiResponse<ViolationResponse[]>> {
    const url = `/iof/ignition_report`;
    return this.http.get<LoginApiResponse<ViolationResponse[]>>(url, { params: params });
  }

  getUserAssets(params?) {
    const url = `/iof/get_assets_details/`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });

  }

  getCustomerDashboard(params) {
    const url = `/iof/customer_dashboard`;
    return this.http.get(url, { params: params });
  }

  getEntityGraphFilterById(params) {
    const url = `/iof/graph/filter/`;
    return this.http.post(url, params);
  }

  getListingCount(key, params) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get(url, { params: params });

  }

  generatePDFreport(params) {
    // const url = `${AppConfig.URL + '/ioa/tests/zenath_trucks_report/'}`;
    const url = `${AppConfig.URL + '/ioa/tests/zenath_trucks_report/'}`;
    return this.http.post(url, params);
    // return this.http.post(url, params);
  }

  getAreasFromClients(params?) {
    const url = `${AppConfig.URL + '/hypernet/entity/get_areas_from_clients/'}`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }
  getContractsFromAreas(params?) {
    const url = `${AppConfig.URL + 'hypernet/entity/get_contracts_from_areas/'}`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }
  getBinsFromContracts(params?) {
    const url = `${AppConfig.URL + 'hypernet/get_bins_from_contracts/'}`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }


  getContractsOfClient(params) {
    const url = `${AppConfig.URL + '/hypernet/entity/get_contract_details_dropdown'}`;
    // return this.http.post (url, params);
    return this.http.post<any>(url, params);

  }


  getDashboardCards(module, dashboardId) {
    const url = `/${module}/dashboard/card?dashboard_id=${dashboardId}`
    return this.http.get<any>(url);
  }

  getVehicleMaintenanceChart() {  //module, dashboardId
    const url = `/iof/maintenance-chart`
    return this.http.get<any>(url);
  }





  getFleetFiltersDropdown() {
    const url = `/iof/fleet`
    return this.http.get<any>(url);
  }

  getFleetVehicles(params) {
    const url = `/iof/fleet_dashboard?limit=${params.limit}&offset=${params.offset}&is_poi=${params.is_poi}&poi_value=${params.poi_id}&poi_value_id=${params.zone_id}&search=${params.search}`;
    return this.http.post<any>(url, params);
  }

  getFleetDrivers(params) {
    const url = `/iof/driver_dashboard?limit=${params.limit}&offset=${params.offset}`;
    return this.http.post<any>(url, params);
  }
  getShift(params) {
    const url = `/iof/shifts/?${params}`;
    return this.http.get<any>(url);
  }
  getFeetType(params) {
    const url = `/iof/driver_group_tab/?${params}`;
    return this.http.get<any>(url);
  }
  setDriverGroup(params) {
    const url = `/iof/driver_group_tab/`;
    return this.http.post<any>(url, params);
  }
  updateDriverGroup(id, param) {
    const url = `/iof/driver_group_tab/?id=${id}`;
    return this.http.patch<any>(url, param);
  }

  deleteGroup(params?) {
    const url = `/iof/driver_group_tab/?id=${params['id']}`;
    return this.http.delete<any>(url, params);
  }


  getFleetDriversForMap(params) {
    const url = `/iof/driver_dashboard`;
    return this.http.post<any>(url, params);
  }

  getFleetVehiclesForMap(params) {
    const url = `/iof/fleet_dashboard`;
    return this.http.post<any>(url, params);
  }

  getPOIDropdown(params) {
    const url = `/iof/poi${(params) ? params : ''}`
    return this.http.get<any>(url);
  }
  getPOIDropdownChange(params) {
    const url = `/iof/select`
    params = {
      "poi": params
    }
    return this.http.post<any>(url, params);
  }

  getZonesDropdown(params) {
    const url = `/iof/zones${(params) ? params : ''}`
    return this.http.get<any>(url);
  }

  getRoutesDropdown(params) {
    const url = `/iof/routes${(params) ? params : ''}`
    return this.http.get<any>(url);
  }

  getTableListing(params) {
    const url = `/iof/routes${params}`
    return this.http.get<any>(url);
  }

  getTravelHistory(params) {
    const url = `/iof/travel_history?limit=${params.limit}&offset=${params.offset}&order=${params.order}&order_by=${params.order_by}&search_key=${params.search_key}`;
    return this.http.post<any>(url, params);
  }

  getTravelHistoryPB(params) {
    const url = `/iof/get_map_travel_history?limit=${params.limit}&offset=${params.offset}&order=${params.order}&order_by=${params.order_by}&search_key=${params.search_key}&truck_id=${params.truck_id}&start_datetime=${params.start_datetime}&end_datetime=${params.end_datetime}`;
    return this.http.get<any>(url);
  }

  getStatistics(params) {
    const url = `/iof/statistics?${params}`;
    return this.http.get<any>(url, params);
  }

  getStops(params) {
    const url = `/iof/stops?limit=${params.limit}&offset=${params.offset}&order=${params.order}&order_by=${params.order_by}&search_key=${params.search_key}`;
    return this.http.post<any>(url, params);
  }

  // For filter stops in playback component
  getStops2(params) {
    const url = `/iof/stops?limit=${params.limit}&offset=${params.offset}&order=${params.order}&order_by=${params.order_by}&search_key=`;
    return this.http.post<any>(url, params);
  }

  getShiftDropdown() {
    const url = `/iof/shifts`;
    return this.http.get<any>(url, {});
  }

  getRoutes(params) {
    const url = `/iof/routes?is_poi=${params.is_poi}&search_key=${params.search_key}`;
    return this.http.get<any>(url, params);
  }

  getZones(params) {
    const url = `/iof/zones?is_poi=${params.is_poi}&search_key=${params.search_key}`;
    return this.http.get<any>(url, params);
  }

  getFleetVehiclesforExport(params) {
    const url = `/iof/fleet_dashboard`;
    return this.http.post<any>(url, params);
  }

  getRoleAccess(params) {
    const url = `/iof/driver_group_tab/?${params}`;
    return this.http.get<any>(url, params);
  }



  // Download PDF and EXCEL File API
  downloadFleetDashboardXLS(param): Observable<Blob> {
    const url = `/iof/fleet_xls?${param}`
    // const options = {headers, param, responseType: 'text' as 'text'};
    // return this.http.get<any>(url).share();
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });

  }

  downloadFleetDashboardPDF(param): Observable<Blob> {
    const url = `/iof/fleet_pdf?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadDriverDashboardXLS(param): Observable<Blob> {
    const url = `/iof/Export_driver_dashboard?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });

  }

  downloadTravelHistoryQuickViewXLS(param): Observable<Blob> {
    const url = `/iof/get_map_travel_history?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });

  }



  downloadManageShiftsXLS(param): Observable<Blob> {
    const url = `/iof/shiftsxle/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadManageShiftsPDF(param): Observable<Blob> {
    const url = `/iof/shiftspdf/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }





  // downloadDriverDashboardPDF(param): Observable<Blob> {
  //   const url = `/iof/Export_driver_dashboard?${param}`
  //   const myHeaders = new HttpHeaders();
  //   myHeaders.append('Access-Control-Allow-Origin', '*');
  //   return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  // }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EntityService } from './entity.service';
import { ApiResponse, ApiResponseNew, LoginApiResponse } from '../../core/model/api.response';
import { TrailMarkerResponse, VehicleSummaryResponse } from '../data/model/location';
import { DropDownItem } from "../data/model/dropdown-item";
import {
  DecantationResponse,
  FillupResponse, MaintenanceDataResponse, MaintenanceResponse, SnapshotResponse,
  ViolationResponse
} from "../data/response/reports-response";
import { TruckTypeEnum } from '../enum/iol-entity.enum';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TruckService extends EntityService {

  constructor(public http: HttpClient) {
    super(http);
  }

  getMapTrail(params?: any): Observable<LoginApiResponse<TrailMarkerResponse[]>> {
    const url = `/iof/map_trail`;
    return this.http.get<LoginApiResponse<TrailMarkerResponse[]>>(url, { params: params });
  }

  getMaintenanceReport(params?: any): Observable<ApiResponse<MaintenanceResponse[]>> {
    const url = `/iof/maintenance_details`;
    return this.http.get<ApiResponse<MaintenanceResponse[]>>(url, { params: params });
  }
  getFillupsReport(params?: any): Observable<LoginApiResponse<FillupResponse[]>> {
    const url = `/iof/get_fillups`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }
  getFillupsReportTab(params) {
    // New API
    const url = `/iof/fuel_fillup_reporting/?${params}`;
    return this.http.get(url);
  }

  getTestReport(params?: any): Observable<LoginApiResponse<FillupResponse[]>> {
    const url = `/hypernet/get_device_data`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }
  getDecantationsReport(params?: any): Observable<LoginApiResponse<DecantationResponse[]>> {
    const url = `/iof/get_decantations`;
    return this.http.get<LoginApiResponse<DecantationResponse[]>>(url, { params: params });
  }
  getSnapshotReport(params?: any): Observable<LoginApiResponse<SnapshotResponse[]>> {
    const url = `/iof/get_snapshot`;
    return this.http.get<LoginApiResponse<SnapshotResponse[]>>(url, { params: params });
  }
  getMaintenanceData(params?: any): Observable<LoginApiResponse<MaintenanceDataResponse[]>> {
    const url = `/iof/maintenance_data_of_entity`;
    return this.http.get<LoginApiResponse<MaintenanceDataResponse[]>>(url, { params: params });
  }

  getPurchaseTypes(params?: any): Observable<LoginApiResponse<DropDownItem[]>> {
    const url = `/options/get_values/`;
    return this.http.get<LoginApiResponse<DropDownItem[]>>(url, { params: params }).pipe(map((item) => {
      item.response['option_values'].forEach((e, i) => {
        item.response['option_values'][i] = new DropDownItem(
          item.response['option_values'][i].id,
          item.response['option_values'][i].label
        );
      });
      return item;
    }));

  }
  getPurchaseTypes1(){
    const url = `/hypernet/entity_sub_type/?key=trucktypes`;
   return this.http.get(url);

  }
  getEntitySubType(params?: any, queryparam?: any) {
    const url = `/hypernet/entity_sub_type/?${queryparam}`;
    return this.http.get(url, { params: params });
  }

  getMaterialType(params?: any): Observable<ApiResponseNew<any>> {
    const url = `/hypernet/entity/get_material_for_skip`;
    return this.http.get<ApiResponseNew<any>>(url, { params: params });

  }

  getTruckSummary(params?: any): Observable<LoginApiResponse<VehicleSummaryResponse[]>> {
    const url = `/iof/vehicle_summary`;
    return this.http.get<LoginApiResponse<VehicleSummaryResponse[]>>(url, { params: params });
  }

  getShiftFuelAndDistance(params?: any) {
    const url = `/iof/last_shift_data`;
    return this.http.get<LoginApiResponse<VehicleSummaryResponse[]>>(url, { params: params });
  }
  getTrucksReporting(params?: any) {
    const url = `/iof/vehicles_dashboard_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }

  getStaffReporting(params?: any) {
    const url = `/iof/staff_dashboard_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }

  getCMSTrucksReporting(params?: any) {
    const url = `/iof/truck_reporting_cms`;
    return this.http.get<LoginApiResponse<any[]>>(url, { params: params });
  }

  getTruckCards(module, dashboardId, entity_id) {
    const url = `/${module}/dashboard/card?dashboard_id=${dashboardId}&entity_id=${entity_id}`
    return this.http.get(url);
  }


  Icons = [
    'assets/images/iol/icon-map-truck-CompactorOnline.png',
    'assets/images/iol/icon-map-truck-TipperOnline.png',
    'assets/images/iol/icon-map-truck-HookLoaderOnline.png',
    'assets/images/iol/icon-map-truck-ChainLoaderOnline.png',
    'assets/images/iol/icon-map-truck-TipperOffline.png',
    'assets/images/iol/icon-map-truck-HookLoaderOffline.png',
    'assets/images/iol/icon-map-truck-ChainLoaderOffline.png',
    'assets/images/iol/icon-map-truck-CompactorOffline.png',
    'assets/images/iol/icon-map-truck.png'
  ];
  public getTrucksIcons(entity_sub_type) {
    if (entity_sub_type === TruckTypeEnum.COMPACTOR) {
      return this.Icons[0];
    } else if (entity_sub_type === TruckTypeEnum.TIPPER_TRUCK) {
      return this.Icons[1];
    } else if (entity_sub_type === TruckTypeEnum.HOOK_LOADER) {
      return this.Icons[2];
    } else if (entity_sub_type === TruckTypeEnum.CHAIN_LOADER) {
      return this.Icons[3];
    } else if (entity_sub_type === TruckTypeEnum.TIPPER_TRUCK) {
      return this.Icons[4];
    } else if (entity_sub_type === TruckTypeEnum.HOOK_LOADER) {
      return this.Icons[5];
    } else if (entity_sub_type === TruckTypeEnum.CHAIN_LOADER) {
      return this.Icons[6];
    } else if (entity_sub_type === TruckTypeEnum.COMPACTOR) {
      return this.Icons[7];
    } else {
      return this.Icons[8];
    }
  }

  getFleetJobSummary(params) {
    const url = `/iof/fleet-job-summary/${params}`;
    return this.http.get(url);
  }

}

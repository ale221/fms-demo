import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { AuthService } from "../../core/services/auth.service";
import { EntityStatusEnum } from "../../core/enum/entity-type.enum";
import { ApiResponse, LoginApiResponse } from "../../core/model/api.response";
import { DropDownItem } from "../data/model/dropdown-item";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { debugger } from 'fusioncharts';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  EntityStatusEnum = EntityStatusEnum;

  constructor(public http: HttpClient,
    private authService: AuthService) {
  }
  saveStaff(key, params: any) {
    const url = `${AppConfig.APIHandler(key)}`;
    return this.http.post(url, params);
  }
  getOptions(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get(url, { params: params });
  }

  getDriverListing() {
    const url = `/hypernet/get_unassigned_driver_fleet/`;
    return this.http.get(url);
  }

  getDriverListing1() {
    const url = `/iof/drivers/`;
    return this.http.get(url);
  }
  getVehicleListing1() {
    const url = `/iof/shifts/`;
    return this.http.get(url);
  }

  getOptionsforDropDown(key, params: any) {
    const url = `/options/get_values/`;
    return this.http.get(url, { params: params });
  }

  test(key, params) {
    const url = `/hypernet/entity/` + key;
    console.log(url);
    return this.http.get(url, { params: params });
  }
  getData(key, params: any) {
    const url = `${AppConfig.APIHandler(key)}`;
    return this.http.get(url, { params: params });
  }
  UpdateProfile(key, params: any) {
    const url = `${AppConfig.APIHandler(key)}`;
    return this.http.patch(url, params);
  }
  AddJob(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.post(url, params);
  }
  postClient(params: any) {
    const url = `${'/hypernet/entity/add_new_client'}`;
    return this.http.post(url, params);
  }
  patchClient(params: any) {
    const url = `${'/hypernet/entity/edit_client'}`;
    return this.http.patch(url, params);
  }
  deleteClient(params: any) {
    const url = `${'/hypernet/entity/delete_clients'}`;
    console.log(this.http.patch(url, params))

    return this.http.patch(url, params);
  }


  getBinsData(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get(url, { params: params });
  }
  getActivityData(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get(url, { params: params });
  }

  postShiftData(params) {
    // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    // let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/driver_shift_assignment/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, params);
  }


  postData(params) {
    // params['customer'] = this.authService.getUser().customer.id;
    params['module_id'] = 1;
    params['modified_by_id'] = this.authService.getUser().customer.id;
    params['status'] = EntityStatusEnum.Active;
    params['use-case'] = 1;
    console.log("params= ", params);
    let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/entity/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, newData);
  }
  postVehicleShift(params) {
    // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    // let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/vasign/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, params);
  }
  getVehicleAllocation(params: any) {
    const url = `/iof/vasign/?${params}`;
    return this.http.get(url);
  }
  patchVehicleShift(params, id) {
    console.log("params for EDIT TOOL= ", params['id'], params)
    //  let newpatchData = this.converToFormdata(params);
    const url = `${'/iof/vasign/' + id + '/'}`;
    return this.http.patch(url, params);

    // const url = `/iof/entity/${id}/`; //`${'/iof/entity'}`;
    // return this.http.patch(url, params);

  }
  deleteVehicleShift(params) { //: any
    const url = `${'/iof/vasign/' + params}/`;
    return this.http.delete(url, params);
    // return this.http.delete(url, { params: null });
  }
  postPoi(params) {
    // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/pois_manage/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, newData);
  }
  postPoiZone(params) {
    console.log("services", params)
    // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/update_zone_poi/?zone_id=' + params.zone; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.patch(url, newData);
  }

  postShift(params) {
    // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    //  let newData = this.converToFormdata(params);
    // old url
    // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/shifts/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, params);
  }

  postDataTrck(params: any) {
    // params.append('customer', String(this.authService.getUser().customer.id));
    // params.append('module', String(1));
    // params.append('modified_by', String(this.authService.getUser().customer.id));
    // params.append('status', EntityStatusEnum.Active);
    const url = `${'/iof/vehicle/'}`;
    return this.http.post(url, params);
  }

  postFleet(params: any) {
    // params.append('customer', String(this.authService.getUser().customer.id));
    // params.append('module', String(1));
    // params.append('modified_by', String(this.authService.getUser().customer.id));
    // params.append('status', EntityStatusEnum.Active);
    const url = `${'/iof/fleet'}`;
    return this.http.post(url, params);
  }

  postCategory(params: any) {

    const url = `${'/iof/category/'}`;
    return this.http.post(url, params);
  }

  patchCategory(params: any) {

    const url = `${'/iof/category'}`;
    return this.http.patch(url, params);
  }

  postDataTrucktype(params: any) {
    // params.append('customer', String(this.authService.getUser().customer.id));
    // params.append('module', String(1));
    // params.append('modified_by', String(this.authService.getUser().customer.id));
    // params.append('status', EntityStatusEnum.Active);
    const url = `${'/hypernet/create_entity_sub_type'}`;
    return this.http.post(url, params);
  }
  patchDataTrucktype(params: any) {
    // params.append('customer', String(this.authService.getUser().customer.id));
    // params.append('module', String(1));
    // params.append('modified_by', String(this.authService.getUser().customer.id));
    // params.append('status', EntityStatusEnum.Active);

    const url = `${'/hypernet/update_entity_sub_type'}`;
    return this.http.patch(url, params);
  }
  postDataFuel(params: any) {
    params['customer'] = this.authService.getUser().customer.id;
    params['module'] = 1;
    params['modified_by'] = this.authService.getUser().customer.id;
    params['status'] = EntityStatusEnum.Active;

    let newData = this.converToFormdata(params);

    console.log("params for fuel creation", newData);


    // const url = `${'/iof/fuel_fill_up/'}`;
    const url = `${'/iof/logistic_fuel/'}`;
    return this.http.post(url, newData);
  }

  deleteDataCheckFuel(params: any) {
    const url = `${'/iof/fuel_fill_up/' + params.id}/`;
    return this.http.get(url, { params: null });
  }

  deleteDataFuel(params) { //: any
    const url = `${'/iof/logistic_fuel/' + params}/`;
    return this.http.delete(url, params);
    // return this.http.delete(url, { params: null });
  }

  patchFuelData(params: any) {
    const url = `${'/iof/logistic_fuel/' + params.id}/`;
    params['module'] = 1;
    return this.http.patch(url, params);
  }

  getEntities(params: any) {
    const url = `/iof/get_entities_list/`;
    return this.http.get(url, { params: params });
  }

  getEntitiesTool(params: any) {
    const url = `/iof/get_entity_new/?${params}`;
    return this.http.get(url);
  }

  getEntitiesDrivers(params: any) {
    const url = `/iof/get_entity_new/?${params}`;
    return this.http.get(url);
  }
  getDriversVehicleAllocations(params: any) {
    const url = `/hypernet/assigneddriverfleet/`;
    return this.http.get(url);
  }
  getDriversVehicleAllocations2(params: any) {
    const url = `/iof/drivers/`;
    return this.http.get(url);
  }

  getPois(params: any) {
    const url = `/iof/pois_manage?${params}`;
    return this.http.get(url);
  }

  getTerritoryEntity(params: any) {
    const url = `/iof/zones/?${params}`;
    return this.http.get(url);
  }

  getShiftLisiting(params: any) {
    const url = `/iof/driver_shift_assignment/?${params}`;
    return this.http.get(url);
  }
  // iof/driver_shift_assignment

  getAllocationListing() {
    const url = ``;
    return this.http.get(url)
  }

  getVehiclesList(params) {
    const url = `/iof/vehicle/?${params}`;
    return this.http.get(url);
  }
  getVehiclesListNew(params) {
    const url = `/iof/active_veh/`;
    return this.http.get(url);
  }
  getZone(param) {
    const url = `/iof/dropdown_zone`;
    return this.http.post(url, param);
  }

  getFleetsList(params) {
    const url = `/iof/filtered_vehicles_active/?fleet_id=${params}`;
    return this.http.get(url);
  }
  getFleetsTruck(params) {
    const url = `/iof/vehicle/filter/`;
    return this.http.post(url, params);
  }
  getCategoryList(params) {
    const url = `/iof/category?${params}`;
    return this.http.get(url);
  }

  getDriverList(params) {
    const url = `/iof/get_fleet_driver?fleet_id=${params}`;
    return this.http.get(url);
  }

  getViolationEntities(params: any) {
    const url = `/iof/get_violation_data/`;
    return this.http.get(url, { params: params });
  }

  getEntitiesFuel(params: any) {
    const url = `/iof/logistic_fuel/?${params}`;
    return this.http.get(url);

    //OLD API
    // const url = `/iof/logistic_fuel/`;
    //return this.http.get(url, { params: params });

  }

  getGatewayDropdownData() {
    const url = `/hypernet/entity_sub_type/?key=trucktypes`;
    return this.http.get(url);
  }

  getNotificationValue() {
    const url = `/options/hypernet_user_configuration`;
    return this.http.get(url);
  }

  saveNotifications(params) {
    const url = `/options/hypernet_user_configuration`;
    return this.http.patch(url, params);
  }

  saveGatewayData(paramsToSend) {
    const url = `${'/iof/create_configuration'}`;
    return this.http.post(url, paramsToSend);
  }

  getDriverScoreCardData() {
    const url = `/options/DriverScoreCard`;
    return this.http.get(url);
  }

  saveDriverScoreCardData(paramsToSend) {
    const url = `${'/options/DriverScoreCard'}`;
    return this.http.post(url, paramsToSend);
  }



  getGatewayData(params) {
    const url = `/iof/create_configuration?type_vehicle=${params}`;
    return this.http.get(url);
  }


  getClientEntities(params: any) {
    const url = `/hypernet/entity/get_clients_list`;
    return this.http.get(url, { params: params });
  }

  postDriverData(params: any) {
    params.append('customer', String(this.authService.getUser().customer.id));
    params.append('module', String(1));
    params.append('modified_by', String(this.authService.getUser().customer.id));
    const url = `${'/hypernet/entity/add_new_entity'}`;
    return this.http.post(url, params);
  }

  patchData(params) {
    console.log("params for EDIT TOOL= ", params['id'], params)
    let newData = this.converToFormdata(params);
    //  let newpatchData = this.converToFormdata(params);
    const url = `${'/hypernet/entity/add_driver/' + params['id'] + '/'}`;
    return this.http.patch(url, newData);

    // const url = `/iof/entity/${id}/`; //`${'/iof/entity'}`;
    // return this.http.patch(url, params);

  }
  patchDriver(params) {
    console.log("params for EDIT TOOL= ", params['id'], params)
    //  let newpatchData = this.converToFormdata(params);
    const url = `${'/hypernet/entity/add_driver/' + params['id'] + '/'}`;
    return this.http.patch(url, params);

    // const url = `/iof/entity/${id}/`; //`${'/iof/entity'}`;
    // return this.http.patch(url, params);

  }
  patchShift(params) {
    const url = `${'/iof/shifts/?id=' + params['id']}`;
    return this.http.patch(url, params);


  }
  patchDataTerritory(params) {
    console.log("params for EDIT TOOL= ", params['id'])
    const url = `${'/hypernet/entity/edit_entity'}`;
    return this.http.patch(url, params);

    // const url = `/iof/entity/${id}/`; //`${'/iof/entity'}`;
    // return this.http.patch(url, params);

  }
  patchPoi(params) {
    console.log("params for EDIT TOOL= ", params['id'])
    const url = `${'/iof/pois_manage/'}`;
    return this.http.patch(url, params);

    // const url = `/iof/entity/${id}/`; //`${'/iof/entity'}`;
    // return this.http.patch(url, params);

  }

  patchToolData(params, id) {
    params['customer'] = this.authService.getUser().customer.id;
    params['module'] = 1;
    // params['modified_by'] = this.authService.getUser().customer.id;
    // console.log("ahmahmahmahmahm",params['modified_by']);
    params['status'] = EntityStatusEnum.Active;
    console.log("params for EDIT TOOL= ", params);

    const url = `/iof/entity/${id}/`;
    return this.http.patch(url, params);
  }

  patchTruckData(params: any) {
    const url = `${'/iof/vehicle'}`;
    return this.http.patch(url, params);
  }
  patchFleet(params: any) {
    const url = `${'/iof/fleet'}`;
    return this.http.patch(url, params);
  }
  patchDataWithUploadStatus(params: any) {
    const url = `${'/hypernet/entity/edit_entity'}`;
    return this.http.patch(url, params, {
      reportProgress: true, observe: 'events'
    });
  }

  deleteData(id) {
    const url = `/iof/entity/${id}/`;
    return this.http.delete(url);
  }

  deleteDataCheck(params: any) {
    console.log(params);
    const url = `${'/hypernet/entity/add_driver/' + params['id'] + '/'}`;
    // return this.http.delete(url, { params: params });
    return this.http.patch(url, params);
  }
  deleteStaff(params?) {
    const url = `/hypernet/entity/add_driver/` + params['id'] + '/';
    return this.http.patch(url, params);
    // console.log(params);
    // const url = `${'/hypernet/entity/add_driver/' + params['id'] + '/'}`;
    // return this.http.delete(url, params);
  }
  deleteVehicleId(params: any) {
    console.log(params);
    const url = `${'/iof/delete_vehicle/'}`;
    // const url = `${'/iof/vehicle/' + params['id'] + '/'}`;       add mark as inactve
    // return this.http.delete(url, { params: params });
    // return this.http.delete(url, params);                        add mark as inactve
    return this.http.patch(url, params);
  }
  deleteVehicleTypeId(params: any) {
    console.log(params);
    const url = `${'/hypernet/delete_entity_vehicle_type/' + params['id']}`;
    // return this.http.delete(url, { params: params });
    return this.http.patch(url, params);
  }
  deleteContract(params: any) {
    console.log(params);
    const url = `${'/hypernet/entity/delete_contract/' + params['id'] + '/'}`;
    // return this.http.delete(url, { params: params });
    return this.http.patch(url, params);
  }
  deleteterritory(params: any) {
    const url = `${'/iof/delete_territory/'}`;
    return this.http.patch(url, params);
  }
  deletePoi(params: any) {
    const url = `${'/iof/delete_poi/'}`;
    return this.http.patch(url, params);
  }
  deleteFleet(params: any) {
    console.log(params);
    const url = `${'/iof/fleet/' + params['id']}/`;
    return this.http.delete(url);
  }

  deleteCategory(params: any) {
    console.log(params);
    const url = `${'/iof/category'}`;
    return this.http.delete(url, { params: params });
  }

  postTemplate(params: any) {
    console.log(params);
    const url = `${'/hypernet/entity/V2/add_new_job'}`;
    console.log(url);
    return this.http.post(url, params);
  }
  patchTemplate(params: any) {
    console.log(params);
    const url = `${'/hypernet/entity/V2/edit_activity_scehdule'}`;
    console.log(url);
    return this.http.patch(url, params);
  }
  postReview(params: any) {
    console.log(params);
    const url = `${'/iof/edit_activity'}`;
    console.log(url);
    return this.http.post(url, params);
  }
  postContract(params: any) {
    console.log(params);
    const url = `${'/hypernet/entity/add_new_entity'}`;
    console.log(url);
    return this.http.post(url, params);
  }
  postContractWithUploadStatus(params: any) {
    console.log(params);
    params['type_id'] = params['type'];
    const url = `${'/hypernet/entity/add_new_entity'}`;
    console.log(url);
    return this.http.post(url, params, {
      reportProgress: true, observe: 'events'
    });
  }
  disableButton(row) {
    if ('status_id' in row) return row.status_id === this.EntityStatusEnum.Inactive;
    if ('status' in row) return row.status === this.EntityStatusEnum.Inactive;
  }
  disableButton2(row) {
    if ('status_id' in row) return row.status_id === this.EntityStatusEnum.Inactive;
    // if ('status' in row) return row.status === this.EntityStatusEnum.Inactive;
  }

  getFormTitle(inactiveState, value, formName) {
    if (inactiveState) return 'View ' + formName;
    if (value) return 'Update ' + formName;
    else
      return 'Create ' + formName


  }
  getOptionsDropdown(params?: any): Observable<LoginApiResponse<DropDownItem[]>> {
    const url = `/options/get_values/`;
    // return this.http.get<ApiResponse<Dropdown[]>>(url, {params: params});
    return this.http.get<LoginApiResponse<DropDownItem[]>>(url, { params: params }).pipe(map((item) => {
      item.response['option_values'].forEach((e, i) => {
        item.response['option_values'][i] = new DropDownItem(item.response['option_values'][i].id,
          item.response['option_values'][i].label);
      });
      return item;
    }));

  }
  genericPost(key, params: any) {
    console.log('generic post params', params);
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.post(url, params);
  }

  getContractsListing(params: any) {
    const url = `/iof/contract_list2/`;
    return this.http.get(url, { params: params });
  }
  getContractsDropdownListing(params: any) {
    const url = `/iof/jobs_dropdown/`;
    return this.http.get(url, { params: params });
  }


  renewContract(params: any) {
    const url = `/iof/post_renew_contract`;
    return this.http.get(url, { params: params });
  }

  updatePaymentStatus(params: any) {
    const url = `/iof/update_payment_status)`;
    return this.http.get(url, { params: params });
  }

  addFine(params: any) {
    const url = `/iof/add_fine)`;
    return this.http.post(url, params);
  }

  getUsecases(graph) {
    const url = `/hypernet/customer/page_settings/?graph=${graph}`;
    return this.http.get(url);
  }

  getUsecasesDashboards(id) {
    const url = `/hypernet/customer/page_settings/customercard/?dashboard_id=${id}`;
    return this.http.get(url);
  }

  getUsecasesDashboardsGraphs(id) {
    const url = `/hypernet/customer/page_settings/customergraph/?dashboard_id=${id}`;
    return this.http.get(url);
  }

  saveCards(params: any) {
    const url = `/hypernet/customer/page_settings/customercard/`;
    return this.http.post(url, params);
  }

  getRoutes(params: any) {
    // const url = `${'/iof/routes'}`;
    // return this.http.get(url, params);

    const url = `/iof/routes/?${params}`;
    return this.http.get(url);

  }
  createRoutes(params: any) {
    const url = `${'/iof/routes'}`;
    return this.http.post(url, params);
  }
  updateRoute(params: any) {
    const url = `${'/iof/routes'}`;
    return this.http.patch(url, params);
  }

  deleteRoute(params: any) {
    const url = `/iof/delete_zone/`;
    return this.http.patch(url, params);
  }

  createPermission(params: any) {
    const url = `${'/api/users/access/'}`;
    return this.http.post(url, params);
  }
  UpdateRoleAccessGroup(params: any) {
    const url = `${'/api/users/access/' + params.id + "/"}`;
    return this.http.patch(url, params);
  }


  getPermissions(params: any) {
    const url = `${'/api/users/access/'}`;
    return this.http.get(url, params);
  }

  deletePermissions(params: any) {
    const url = `/api/users/group_role_access/?id=${params}`;
    return this.http.delete(url);

    // const url = `${'/iof/routes_delete'}`;
    // return this.http.patch(url, params);
  }

  createGroup(params: any) {
    const url = `${'/api/users/group_role_access/'}`;
    return this.http.post(url, params);
  }

  getGroup(params: any) {
    const url = `/api/users/group_role_access/${params ? params : ''}`;
    return this.http.get(url);
  }

  // getUsersEmails(params) {
  //   const url = `${'/api/users/userlist/'}`;
  //   return this.http.get(url, params)
  // }
  getUsersEmails(params) {
    const url = `${'/api/users/vfq_user_list/'}`;
    return this.http.get(url, params);
  }

  getUsersEmailsDD(params) {
    const url = `${'/api/users/roleuser/'}`;
    return this.http.get(url, params);
  }

  getGroupData() {
    const url = `${'/api/users/menulist/'}`;
    return this.http.get(url);
  }


  deleteGroup(params: any) {
    const url = `/iof/permissions?id=${params}`;
    return this.http.delete(url);
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return form_data;
  }

  driverGroupsDocument() {
    const url = `/iof/driver-groups`;
    return this.http.get(url);
  }
  driverfromGroupsDocument(driverId) {
    const url = `/iof/drivers_of_group/${driverId}`;
    return this.http.get(url);
  }

  returnDocumentType(driverId) {
    const url = `/hypernet/entity/document-type?driver_id=${driverId}`;
    return this.http.get(url);
  }

  getDocumentType() {
    const url = `/iof/document-types-new`;
    return this.http.get(url);
  }
  getDocumentTypeFleet() {
    const url = `/hypernet/entity/fleet-document`;
    return this.http.get(url);
  }
  postDocument(param) {
    const url = `${'/hypernet/entity/documents'}`;
    // let newData = this.converToFormdata(param);
    // return this.http.post(url,param);
    return this.http.post(url, param);
  }
  postDocumentFleet(param) {
    const url = `${'/hypernet/entity/fleet-documents'}`;
    // let newData = this.converToFormdata(param);
    // return this.http.post(url,param);
    return this.http.post(url, param);
  }
  patchDocument(params: any) {
    // let newData = this.converToFormdata(params);
    const url = `${'/hypernet/entity/documents'}`;
    return this.http.patch(url, params, {
      reportProgress: true, observe: 'events'
    });
  }
  patchDocumentFleet(params: any) {
    // let newData = this.converToFormdata(params);
    const url = `${'/hypernet/entity/fleet-documents'}`;
    return this.http.patch(url, params, {
      reportProgress: true, observe: 'events'
    });
  }
  deleteDocument(params: any) {
    const url = `${'/hypernet/entity/documents/' + params['id'] + '/' + params['documentTypeId']}`;
    return this.http.delete(url, params);
  }
  deleteDocumentFleet(params: any) {
    const url = `${'/hypernet/entity/fleet-documents/' + params['id'] + '/' + params['documentTypeId']}`;
    return this.http.delete(url, params);
  }
  getDocumentListing(params: any) {
    const url = `/hypernet/entity/documents`;
    return this.http.get(url);
  }
  getDocumentListingFleet(params: any) {
    const url = `/hypernet/entity/fleet-documents`;
    return this.http.get(url);
  }
  getDocumentListingSearch(params: any) {
    const url = `/hypernet/entity/documents`;
    return this.http.get(url, { params: params });
  }
  getDocumentListingSearchfleet(params: any){
    const url = `/hypernet/entity/fleet-documents`;
    return this.http.get(url, { params: params });
  }
  uploadUserBulkUpload(param) {
    // const url = `/api/users/vfq_user_bulk_upload`;   //old api
    const url = `/iof/bulk-upload-staff`;
    return this.http.post<LoginApiResponse<any>>(url, param);
  }
  multiDeleteUsers(params?: any) {
    const url = `/iof/bulk-delete-staff`;
    return this.http.patch(url, params);
  }
  getFleetFiltersDropdown() {
    const url = `/iof/fleet`
    return this.http.get<any>(url);
  }





  downloadFleetListingXLS(param): Observable<Blob> {
    const url = `/iof/manage_xls/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadFleetListingPDF(param): Observable<Blob> {
    const url = `/iof/manag_pdf/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }


  downloadDriverListingXLS(param): Observable<Blob> {
    const url = `/iof/dm1/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadDriverListingPDF(param): Observable<Blob> {
    const url = `/iof/dm2/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadDriverGroupXLS(param): Observable<Blob> {
    const url = `/iof/excletab/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadDriverGroupPDF(param): Observable<Blob> {
    const url = `/iof/dpftab/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }



}

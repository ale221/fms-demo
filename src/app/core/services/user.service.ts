import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse, LoginApiResponse } from '../model/api.response';
import { User } from '../model/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(public http: HttpClient) {
  }
  user: User;
  fleet: any;
  territory: any;
  client: any;

  setSelectedUser(data) {
    this.user = data;
  }
  getSelectedUser() {
    return this.user;
  }
  destorySelectedUser() {
    return null;
  }

  setSelectedFleet(data) {
    this.fleet = data;
  }
  getSelectedFleet() {
    return this.fleet;
  }

  setSelectedTerritory(data) {
    this.territory = data;
  }
  getSelectedTerritory() {
    return this.territory;
  }

  setSelectedClient(data) {
    this.client = data;
  }
  getSelectedClient() {
    return this.client;
  }


  login(user: User): Observable<LoginApiResponse<User>> {
    const url = `/api/users/login/`;
    return this.http.post<LoginApiResponse<User>>(url, user);
  }

  sendEmailForForgetPassword(email: any) {
    // console.log(email);
    const url = `/api/users/regenerate_reset_token/`;
    return this.http.patch(url, email);

  }

  verifyCode(code: any) {
    const url = `/api/users/verfiy_user_token/`;
    return this.http.post(url, code);
  }

  createNewPassword(val: any) {
    console.log(val);
    const url = `/api/users/change_password/`;
    return this.http.post(url, val);
  }
  getUserData(params?: any): Observable<LoginApiResponse<any>> {
    const url = `/api/users/get_user_profile/`;
    return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }

  modifyUserData(params) {
    const url = `/api/users/modify_user_details`;
    return this.http.patch(url, params);
  }

  modifyUserData2(params) {
    let dju = this.converToFormdata(params);
    const url = `/api/users/update_profile_new`;
    return this.http.patch(url, dju);
  }

  forgotPasword(params) {
    const url = `/api/users/regenerate_reset_token`;
    return this.http.patch(url, params);
  }
  verifyToken(params) {
    const url = `/api/users/verfiy_user_token`;
    return this.http.patch(url, params);
  }
  resetPassword(params) {
    // const url = `/api/users/reset_user_password_token`;
    const url = `/api/users/change_password_mobile`;
    return this.http.patch(url, params);
  }

  addNewUser(params) {
    // const url = `/api/users/vfq_user_create`;
    const url = `/api/users/customer_user/`;
    return this.http.post(url, params);
  }

  editNewUser(params) {
    // const url = `/api/users/vfq_user_edit`;
    const url = `/api/users/customer_user/`;
    return this.http.patch(url, params);
  }
  getUsers(params?) {
    const url = `/api/users/vfq_user_list?${params}`;
    return this.http.get(url);

    // OLD API
    // const url = `/api/users/vfq_user_list`;
    // return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }
  getcontract(params) {
    const url = `/iof/get_contracts_list?${params}`;
    return this.http.get(url);
  }
  getClients() {
    const url = `/hypernet/entity/get_entity_type_dropdown/?entity=36`;
    return this.http.get(url);
  }
  postContract(params) {
    // // params['customer'] = this.authService.getUser().customer.id;
    // params['module_id'] = 1;
    // params['modified_by_id'] = this.authService.getUser().customer.id;
    // params['status'] = EntityStatusEnum.Active;
    // params['use-case'] = 1;
    // console.log("params= ", params);
    // // let newData = this.converToFormdata(params);
    // // old url
    // // const url = `${'/hypernet/entity/add_new_entity'}`;
    const url = '/iof/entity/'; //`${'/hypernet/entity/add_driver/'}`;
    return this.http.post(url, params);
  }

  getUserById(param) { //added new api here
    console.log("params for get specific user by id== ", param);
    const url = `/api/users/vfq_user_get`;
    return this.http.get<LoginApiResponse<any>>(url, { params: param });
  }

  uploadUserBulkUpload(param) {
    // const url = `/api/users/vfq_user_bulk_upload`;   //old api
    const url = `/api/users/bulk_upload_users`;
    return this.http.post<LoginApiResponse<any>>(url, param);
  }

  downloadRejectedUserList(array) {
    const url = `/api/users/download_rejected_user_list`;
    return this.http.post<LoginApiResponse<any>>(url, array);
  }


  deleteUsers(params?) {
    const url = `/api/users/delete_user/`;
    return this.http.patch(url, params);
  }
  multiDeleteUsers(params?: any) {
    const url = `/api/users/delete_bulk_users/`;
    return this.http.patch(url, params);
  }
  deleteShift(params?) {
    console.log("params,", params);
    const url = `/iof/shifts/?id=${params.id}`;
    return this.http.patch(url, params);
  }

  deletePermission(params?) {
    const url = `/api/users/user_role/?id=${params.user_id}`;
    return this.http.delete(url);
  }

  getUsersCount() {
    const url = `/api/users/user_role_count`;
    return this.http.get<LoginApiResponse<any>>(url);

  }
  editNewPermission(params) {
    const url = `/api/users/user_role_count`;
    return this.http.post<LoginApiResponse<any>>(url, params);

  }
  addNewPermission(params) {
    const url = `/api/users/user_role`;
    return this.http.post<LoginApiResponse<any>>(url, params);

  }
  getPermission() {
    const url = `/api/users/user_role`;
    return this.http.get<LoginApiResponse<any>>(url);

  }
  getFleet() {
    const url = `/iof/fleet_list`;
    return this.http.get<LoginApiResponse<any>>(url);

  }
  editNewFleet(params) {
    const url = `/iof/fleet_edit`;
    return this.http.patch<LoginApiResponse<any>>(url, params);

  }
  addNewFleet(params) {
    const url = `/iof/fleet_add`;
    return this.http.post<LoginApiResponse<any>>(url, params);

  }
  getAudit() {
    const url = `/options/get_log/`;
    return this.http.get<LoginApiResponse<any>>(url);
  }
  getAllGroups(params) {
    const url = `/api/users/get_groups/?${params}`;
    return this.http.get(url);
  }
  getPermissionGroups() {
    // return this.http.get('/api/users/get_all_permissions?type=2');

    const url = '/api/users/get_all_permissions?type=2'// `/api/users/user_role/?id=${params.user_id}`;
    return this.http.get<LoginApiResponse<any>>(url);
  }
  getPermissionGroupById(id) {
    const url = `/api/users/get_groups/?type=2&id=${id}`;
    return this.http.get(url);
  }
  editPermissionGroup(data) {
    // return this.http.patch(data, `/api/users/update_group/`);
    const url = `/api/users/update_group/`;
    return this.http.patch(url, data);
  }
  createPermissionGroup(data) {
    // return this.http.post(data, '/api/users/add_group_permissions/');
    const url = `/api/users/add_group_permissions/`;
    return this.http.post(url, data);
  }
  deletePermissionGroup(id) {
    // `/api/users/delete_group/?id=${id}`
    const url = `/api/users/delete_group/` + id;
    return this.http.delete(url);
  }

  //GET DETAILS FOR AUDIT REPORT

  // getAUDIT(params?) {
  //   const url = `/options/get_audit_log/?${params}`;
  //   return this.http.get(url);

  // }

  //get the dropdown data in audit report
  getDropDownData() {
    const url = `/options/get_filter/`;
    return this.http.get(url);
  }

  //exportFile on audit form

  sendDataForExportAudit(params) {
    const url = `/options/get_export_file/?${params}`;
    return this.http.get(url);
  }

  uploadUserDocuments(data) {
    console.log("calling upload API... ", data);
    const url = `/options/upload_document/`;
    return this.http.post(url, data);
  }

  getDocuments(params) {
    const url = `/options/get_document`;
    return this.http.get(url);
  }

  getDocumentType() {
    const url = `/hypernet/get_driver_document_type`;
    return this.http.get(url);
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return form_data;
  }
}

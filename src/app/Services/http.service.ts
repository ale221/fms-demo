import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateUtils } from '../Utils/DateUtils';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  loggen_in_user;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loggen_in_user = authService.getUser();
  }

  get(url) {
    return this.http.get(url);
  }

  post(data, url) {
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    data['status'] = "active";
    // console.log(data);
    return this.http.post(url, data);
  }

  postWithoutStatus(data, url) {
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    return this.http.post(url, data);
  }

  postFormData(data, url) {
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    data['status'] = "active";
    var form_data = this.converToFormdata(data);
    return this.http.post(url, form_data);
  }


  postFormDataWithoutDefaultActiveStatus(data, url) {
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    var form_data = this.converToFormdata(data);
    return this.http.post(url, form_data);
  }

  filter(data, url) {
    return this.http.post(url, data);
  }

  patch(data, url) {
    data['modified_by_id'] = this.loggen_in_user['id'];
    data['modified_datetime'] = DateUtils.getUtcDateTimeStart(new Date().toISOString());
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    data['status'] = "active";
    return this.http.patch(url, data);
  }

  patchFormData(data, url) {
    data['modified_by_id'] = this.loggen_in_user['id'];
    data['modified_datetime'] = DateUtils.getUtcDateTimeStart(new Date().toISOString());
    data['created_by_id'] = this.loggen_in_user['id'];
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    data['status'] = "active";
    var form_data = this.converToFormdata(data);
    return this.http.patch(url, form_data);
  }

  patchFormDataWithoutDefaultActiveStatus(data, url) {
    data['modified_by_id'] = this.loggen_in_user['id'];
    data['modified_datetime'] = DateUtils.getUtcDateTimeStart(new Date().toISOString());
    data['company_id'] = this.authService.getUser()['company_id'];
    data['os'] = "web";
    var form_data = this.converToFormdata(data);
    return this.http.patch(url, form_data);
  }

  delete(url) {
    return this.http.delete(url);
  }

  converToFormdata(data) {
    var form_data = new FormData();
    for (var key in data) {
      form_data.append(key, data[key]);
    }
    return form_data;
  }

}

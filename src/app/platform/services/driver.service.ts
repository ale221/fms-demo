import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../../app.config';
import {LoginApiResponse} from '../../core/model/api.response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {

  constructor(public http: HttpClient) {
  }


  getDriversData(params?): Observable<LoginApiResponse<any[]>>  {
    const url = `/iof/get_drivers_list`;
    return this.http.get<LoginApiResponse<any[]>>(url, {params: params});
  }

  getShiftData(params?): Observable<LoginApiResponse<any[]>>  {
    const url = `/iof/shift_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, {params: params});
  }

  getFineData(params?): Observable<LoginApiResponse<any[]>>  {
    const url = `/iof/fine_reporting`;
    return this.http.get<LoginApiResponse<any[]>>(url, {params: params});
  }

}

import { Injectable } from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {AuthService} from '../../core/services/auth.service';
import {EntityResponse} from '../model/entity.response';
import {ApiResponse} from '../../core/model/api.response';
import { Observable } from 'rxjs';

@Injectable()
export class JobService {

  constructor(public http: HttpClient,
              private authService: AuthService) {
  }
  getOptions(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get (url, {params: params});
  }
  getJobDetails(key, params?) : Observable<ApiResponse<any[]>> {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get<ApiResponse<any[]>>(url, {params: params})
  }


  getJobsSummary(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    // console.log(url);
    return this.http.get (url, {params: params});
  }

}

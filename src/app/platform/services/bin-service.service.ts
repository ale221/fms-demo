import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EntityService} from './entity.service';
import {AppConfig} from "../../app.config";
import {ApiResponse, LoginApiResponse} from "../../core/model/api.response";
import {EntityResponse} from "../model/entity.response";
import {EntityStatusEnum} from '../../core/enum/entity-type.enum';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BinService extends EntityService {

  constructor(public http: HttpClient) {
    super(http);
  }

  getEventReport(id, params?: any): Observable<LoginApiResponse<any[]>> {
    const url = `${AppConfig.URL}/hypernet/entity/V2/get_bins_activities`;
    return this.http.get<LoginApiResponse<any[]>>(url, {params: params})
  }
  getEventReportNew(params): Observable<LoginApiResponse<any[]>> {
    console.log(params);
    const url = `${AppConfig.URL}/hypernet/entity/V2/get_bins_activities`;
    return this.http.get<LoginApiResponse<any[]>>(url, {params: params});
  }

  terminateContract(params) {
    const url = `${AppConfig.URL + '/iof/contract_termination'}`;
    return this.http.post (url, params);
  }
}

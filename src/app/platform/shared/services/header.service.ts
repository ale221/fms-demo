import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { Observable } from 'rxjs';
import { ApiResponse, LoginApiResponse } from 'src/app/core/model/api.response';
import { User } from 'src/app/core/model/user';


@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(public http: HttpClient) {
  }
  getSearch(key, params: any) {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get(url, { params: params });
  }

  getIoLNotificationCount(params?: any) {
    const url = `${AppConfig.URL}/hypernet/notifications/get_user_alerts_count`;
    return this.http.get(url, { params: params });
  }

  getIolNotifications(key, params?: any): Observable<ApiResponse<any>> {
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get<ApiResponse<any>>(url, { params: params });
  }


  logOut(user): Observable<LoginApiResponse<User>> {
    const url = `/api/users/logout_user/`;
    return this.http.post<LoginApiResponse<User>>(url, user);
  }


}

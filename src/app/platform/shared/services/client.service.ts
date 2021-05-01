import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';

@Injectable()
export class ClientService {

  constructor(public http: HttpClient) {
  }
  getBinsOfClient(params: any) {
    const url = `${AppConfig.URL}/iof/get_bins_of_client`;
    return this.http.get (url, {params: params});
  }
  getClient(params) {
    const url = `/hypernet/entity/get_clients_list?${params}`;
    return this.http.get(url);

    // OLD API
    // const url = `/api/users/vfq_user_list`;
    // return this.http.get<LoginApiResponse<any>>(url, { params: params });
  }
  postClient(params: any) {
    const url = '/hypernet/entity/add_new_client';
    return this.http.post(url, params);
  }
  patchClient(params: any) {
    const url =  '/hypernet/entity/edit_client';
    return this.http.patch(url, params);
  }
  deleteClient(params: any) {
    const url =  '/hypernet/entity/delete_clients';

    return this.http.patch(url, params);
  }

}

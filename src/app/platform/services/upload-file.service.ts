import { Injectable } from '@angular/core';
import {AppConfig} from '../../app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UploadFileService {

  constructor(private http: HttpClient) { }

  uploadFile(params: any) {
    const url = AppConfig.URL + '/ioa/tests/upload_data_cms';
    return this.http.post (url, params);
  }

}

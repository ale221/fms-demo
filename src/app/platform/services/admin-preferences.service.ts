import { Injectable } from '@angular/core';
import {AppConfig} from "../../app.config";
import {HttpClient} from "@angular/common/http";
import {hypernymModules} from "../../core/model/module";

@Injectable()
export class AdminPreferencesService {

  constructor(public http: HttpClient) { }

  getPreferences(params?: any) {
    const url = `${AppConfig.URL}/hypernet/customer/get_preferences`;
    return this.http.get (url, {params: params});
  }

  setPreferences(params: any) {
    const url = `${AppConfig.URL}/hypernet/customer/modify_preferences`;
    return this.http.patch (url, params);

  }


  getForm(preferredModule){
    if(preferredModule === hypernymModules.ffp)
      return { shift_hours: [null] }


  }

}

import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AppConfig} from "../../app.config";

@Injectable({
  providedIn: 'root'
})
export class TerritoryService {

  constructor(public http: HttpClient) {
  }

  getTerritoryInfo() {
    const url = `${AppConfig.URL}/iof/get_territory_info/`;
    return this.http.get(url);
  }

}

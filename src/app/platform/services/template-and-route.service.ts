import { Injectable } from '@angular/core';
import { AppConfig } from '../../app.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JobStatusEnum } from '../enum/iol-entity.enum';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TemplateAndRouteService {

  constructor(public http: HttpClient) {
  }


  getBinsForTemplates(params) {
    const url = `/hypernet/entity/get_template_bins`;

    return this.http.get(url, { params: params });
  }

  getBinsRecommendation(params) {
    const url = `/hypernet/entity/V2/route_recommendations`;
    return this.http.post(url, params);
  }

  postTemplateForm(params) {
    const url = `/hypernet/entity/job/create_template`;
    return this.http.post(url, params);
  }
  postDriverShift(params) {
    const url = `/iof/driver_shift_assignment/`;
    return this.http.post(url, params);
  }

  patchTemplateForm(params) {
    const url = `/hypernet/entity/job/create_template`;
    return this.http.patch(url, params);
  }

  getTemplates(params?) {
    const url = `/hypernet/entity/job/template_listing?${params}`;
    return this.http.get(url, params);
  }
  getShiftsData(params) {
    const url = `/iof/driver_shift_assignment/?${params}`;
    return this.http.get(url);
  }
  getDriversShift(params?) {
    const url = `/iof/drivers/`;
    return this.http.get(url, { params: params });
  }
  getDriverFilterShift(driverGroupID?) {
    const url = `/iof/get_driver_group/?group_id=${driverGroupID}`;
    return this.http.get(url);
  }
  getShiftDrivers(params?) {
    const url = `/iof/allocation_shift_dropdown/`;
    return this.http.get(url, { params: params });
  }
  patchShiftDrivers(params?, id?) {
    const url = `/iof/driver_shift_assignment/${id}/`;
    return this.http.patch(url, params);
  }
  deleteShiftDrivers(params?) {
    const url = `/iof/driver_shift_assignment/${params}/`;
    return this.http.delete(url, params);
  }
  getDriverGroup() {
    const url = `/hypernet/get_driver_group/`;
    return this.http.get(url);
  }

  getTemplateDropdownBins(params?) {
    const url = `/hypernet/entity/get_template_dropdown_bins`;
    return this.http.get(url, { params: params });
  }


  getRouteDetail(params?) {
    const url = `/hypernet/entity/V2/get_activities_details`;
    return this.http.get(url, { params: params });
  }

  createActivityFromTemplate(params) {
    const url = `/hypernet/entity/V2/create_route`;
    return this.http.post(url, params);
  }

  getScheduleActivities(params: any) {
    const url = `/hypernet/entity/V2/get_activities_data`;
    return this.http.get(url, { params: params });
  }

  getRouteListing(params: any) {
    const url = `/hypernet/entity/V2/route_listing`;
    return this.http.get(url, { params: params });
  }


  getClass(status) {
    if (status === JobStatusEnum.Running || status === JobStatusEnum.Resumed) {
      return 'label-info';
    } else if (status === JobStatusEnum.Pending || status === JobStatusEnum.Suspended) {
      return 'bg-yellow-600';
    } else if (status === JobStatusEnum.Aborted || status === JobStatusEnum.Rejected || status === JobStatusEnum.UnCollected || status === JobStatusEnum.Failed) {
      return 'label-danger';
    } else if (status === JobStatusEnum.Completed || status === JobStatusEnum.Collected || status == JobStatusEnum.Active) {
      return 'label-success';
    } else if (status === JobStatusEnum.Skip_Verification) {
      return 'bg-blue-500';
    } else if (status === JobStatusEnum.Collect_Waste || status === JobStatusEnum.Waste_Collected) {
      return 'bg-green-800';
    } else if (status === JobStatusEnum.Conflicting) {
      return 'bg-orange-600';
    } else if (status === JobStatusEnum.Accepted) {
      return 'bg-blue-600';
    } else if (status === JobStatusEnum.Conflicting) {
      return 'bg-blue-600';
    } else if (!status) {
      return 'label-danger';
    } else {
      return 'bg-teal-600';
    }

  }


  abortActivity(key, params: any) {
    const url = `/hypernet/entity/V2/update_running_activity/`;
    return this.http.post(url, params);
  }


  getTemplateDropdown(params?) {
    const url = `/hypernet/entity/V2/template_dropdown`;
    return this.http.get(url, { params: params });
  }

  deleteJob(params?) {
    const url = `/hypernet/entity/job/delete_template/?id=${params}`;
    return this.http.delete(url, params);
  }



  downloadManageJobsXLS(param): Observable<Blob> {
    const url = `/iof/job1/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }

  downloadManageJobsPDF(param): Observable<Blob> {
    const url = `/iof/job2/?${param}`
    const myHeaders = new HttpHeaders();
    myHeaders.append('Access-Control-Allow-Origin', '*');
    return this.http.get(url, { responseType: 'blob', headers: myHeaders });
  }
}

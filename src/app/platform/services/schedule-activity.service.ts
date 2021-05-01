import { Injectable } from '@angular/core';
import {AppConfig} from "../../app.config";
import {HttpClient} from "@angular/common/http";
import {JobStatusEnum} from "../enum/iol-entity.enum";

@Injectable({
  providedIn: 'root'
})
export class ScheduleActivityService {

  obj = {
    "message": {
      "success": "Operation_Successful"
    },
    "status": true,
    "response": {
      "schedules": [
        [
          {
            "id": 1,
            "customer": 1,
            "customer_name": "demo",
            "module": 1,
            "module_name": "Internet Of Logistics",
            "activity_type": 77,
            "activity_type_label": "bin_collection",
            "primary_entity": 5,
            "primary_entity_name": "Truck 1",
            "start_date": "2018-04-24",
            "end_date": "2018-04-28",
            "activity_start_time": "10:02:07",
            "action_items": "7",
            "modified_by": 1,
            "modified_by_name": "Demo Customer",
            "schedule_activity_status_label": null,
            "schedule_activity_status": null,
            "actor": 6,
            "actor_name": "Driver 1",
            "activity_end_point": 10,
            "activity_end_point_name": "E11"
          }
        ]
      ],
      "activities": [
        {
          "id": 1,
          "activity_schedule": 1,
          "action_items": "1,2,6,8,87,22",
          "customer": 1,
          "customer_name": "demo",
          "module": 1,
          "module_name": "Internet Of Logistics",
          "activity_status": 60,
          "activity_status_label": "Volume",
          "created_datetime": "2018-04-24T06:12:21Z",
          "start_datetime": null,
          "end_datetime": null,
          "notification_sent": false,
          "start_lat_long": null,
          "end_lat_long": null,
          "actor": 6,
          "actor_name": "Driver 1",
          "primary_entity": 5,
          "primary_entity_name": "Truck 1",
          "activity_end_point": 20,
          "activity_end_point_name": "new dump site-dashboard 2"
        }
      ]
    }
  };
  constructor(public http: HttpClient) { }

  getScheduleDetail(params?: any) {
    const url = `/hypernet/entity/V2/get_activity_schedules`;
    return this.http.get (url, {params: params});
  }
  getScheduleActivities(params: any) {
    const url = `/hypernet/entity/V2/get_activities_data`;
    return this.http.get (url, {params: params});
  }

  getCollectionEvents(params: any) {
    const url = `/hypernet/entity/V2/get_collection_events`;
    return this.http.get (url, {params: params});
  }

  // getActivityDetail(params: any) {
  //   const url = `/hypernet/entity/V2/get_activities_data`;
  //   return this.http.get (url, {params: params});
  //
  // }

  suspendSchedule(params: any) {
    const url = `${AppConfig.URL + '/hypernet/entity/V2/suspend_resume_activity_schedule'}`;
    return this.http.post(url, params);
  }
  getDummy() {
    return this.obj;
  }
  getClass(status) {
    if (status === JobStatusEnum.Running || status === JobStatusEnum.Resumed) {
      return 'label-info';
    }
    else if (status === JobStatusEnum.Pending ||  status === JobStatusEnum.Suspended) {
      return 'bg-yellow-600';
    }
    else if (status === JobStatusEnum.Aborted || status ===  JobStatusEnum.Rejected || status === JobStatusEnum.UnCollected || status === JobStatusEnum.Failed) {
      return 'label-danger';
    }
    else if (status === JobStatusEnum.Completed || status === JobStatusEnum.Collected || status == JobStatusEnum.Active) {
      return 'label-success';
    }
    else if (status === JobStatusEnum.Skip_Verification) {
      return 'bg-blue-500';
    }
    else if (status === JobStatusEnum.Collect_Waste || status === JobStatusEnum.Waste_Collected) {
      return 'bg-green-800';
    }
    else if ( status === JobStatusEnum.Conflicting)  {
      return 'bg-orange-600';
    }
    else if ( status === JobStatusEnum.Accepted) {
      return 'bg-blue-600';
    }
    else if ( status === JobStatusEnum.Conflicting) {
      return 'bg-blue-600';
    }
    else if(!status){
      return 'label-danger';
    }
    else {
      return 'bg-teal-600';
    }

  }

  generatePDFforActivity(params) {
    const url = `${AppConfig.URL + '/ioa/tests/zenath_activity_report/'}`;
    return this.http.post(url, params);
  }


}

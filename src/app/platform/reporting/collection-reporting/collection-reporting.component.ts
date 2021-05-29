import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output, EventEmitter
} from '@angular/core';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse, TestApiResponse} from '../../../core/model/api.response';
import {TruckResponse} from '../../data/response/entity-response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {ScheduleActivityService} from '../../services/schedule-activity.service';
import {AppLoader} from '../../data/model/app-loader';
import {DateUtils} from '../../../core/date.utils';
import {differenceInSeconds, format} from 'date-fns';
import {ReportResponse} from '../../model/reportResponse';
import {TruckService} from '../../services/truck.service';
import {SwalService} from '../../../core/services/swal.service';
import {isNullOrUndefined} from '@swimlane/ngx-datatable';
import {EntityType} from '../../../core/enum/entity-type.enum';
import { GetNullOrUndefinedPipe } from 'src/app/core/pipes/get-null-or-undefined.pipe';

@Component({
  selector: 'app-collection-reporting',
  templateUrl: './collection-reporting.component.html',
  styleUrls: ['./collection-reporting.component.css'],
})
export class CollectionReportingComponent implements OnDestroy {


  @Input() entity;
  @Input() isEntityTruck? = true;
  @Input() isEntityClient? = false;

  @Output() pdfReportObj: EventEmitter<any> = new EventEmitter<any>();


  collectionsLoader = new AppLoader();
  collections = [];
  collectionsDateRange = [];
  reportObj = new ReportResponse();
  callObj;


  private csvCols = [
    {field: 'actor_name', header: 'Driver'},
    {field: 'entity_name', header: 'Truck'},
    {field: 'area_name', header: 'Area'},
    {field: 'action_item_name', header: 'Bin'},
    {field: 'client_name', header: 'Customer'},
    {field: 'contract_name', header: 'Contract'},
    {field: 'invoice', header: 'Invoice'},
    {field: 'status_label', header: 'Status'},
    {field: 'timestamp', header: 'Timestamp', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'timestamp_2', header: 'Timestamp 2', time: true, format: 'MMM d, y, h:mm:ss a'},
    {field: 'activity_duration', header: 'Activity Duration'},
    {field: 'verified', header: 'Verified'},
    {field: 'pre_weight', header: 'Pre-Weight'},
    {field: 'post_weight', header: 'Post-Weight'},
    {field: 'weight', header: 'Weight'},
  ];


  constructor(private swalService: SwalService, private scheduleActivityService: ScheduleActivityService) {
  }



  getClass(status) {
    return this.scheduleActivityService.getClass(status);
  }

  reset() {
    this.collections = [];
    this.collectionsDateRange = [];
  }


  getReport(event) {
    this.collections = [];
    const dateRange = event[0];
    const start_date = DateUtils.getUtcDateTimeStart(dateRange[0]);
    const end_date = DateUtils.getUtcDateTimeEnd(dateRange[1]);

    this.collectionsDateRange = [DateUtils.getYYYYMMDD(dateRange[0]), DateUtils.getYYYYMMDD(dateRange[1])];

    this.getCollectionsByRange(0, 50, start_date, end_date);
  }


  private getCollectionsByRange(index_a, index_b, start_date, end_date) {

    let results_remaining;
    const params = {
      start_date: start_date,
      end_date: end_date,
      index_a: index_a,
      index_b: index_b
    };

    // console.log(this.entity);



    switch (this.entity.type) {
      case EntityType.BIN:
        params['bin_id'] = this.entity.id;
        break;

      case EntityType.TRUCK:
        params['truck_id'] = this.entity.id;
        break;

      case EntityType.DRIVER:
        params['driver_id'] = this.entity.id;
        break;

      case EntityType.CLIENT:
        params['client_id'] = this.entity.id;
        break;


    }


    this.callObj = this.scheduleActivityService.getCollectionEvents(params)
      .subscribe(new class extends HttpController <TestApiResponse<any>> {
          onComplete(): void {
            if (results_remaining) {
              index_a += 50;
              index_b += 50;
              this.context.getCollectionsByRange(index_a, index_b, start_date, end_date);
            }
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            // console.log(errorMessage);
          }

          onNext(apiResponse: TestApiResponse<TruckResponse[]>): void {
            results_remaining = apiResponse.remaining;

            // console.log('collections', apiResponse);

            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.collections = [...apiResponse.response, ...this.context.collections];
            }

            if (apiResponse.status === HttpStatusCodeEnum.Error) {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }
        }(this.collectionsLoader)
      );
  }


  generatePDFReport(type: any) {
    this.reportObj.data = [];
    this.reportObj.start_datetime = this.collectionsDateRange[0];
    this.reportObj.end_datetime = this.collectionsDateRange[1];
    this.reportObj.cols = ['Area', 'Bin', 'Customer', 'Contract', 'Invoice', 'Status', 'Timestamp', 'Verified', 'Weight'];
    if (this.isEntityTruck) {
      this.reportObj.cols.push('Actor');
    } else {
      this.reportObj.cols.push('Truck');
    }


    for (let i = 0; i < this.collections.length; i++) {
      // @ts-ignore
      this.reportObj.data.push(
        {
          'Area': this.collections[i].area_name ? this.collections[i].area_name : '-',
          'Bin': this.collections[i].action_item_name ? this.collections[i].action_item_name : '-',
          'Customer': this.collections[i].client_name ? this.collections[i].client_name : '-',
          'Contract': this.collections[i].contract_name ? this.collections[i].contract_name : '-',
          'Invoice': this.collections[i].invoice ? this.collections[i].invoice : '-',
          'Status': this.collections[i].status_label ? this.collections[i].status_label : '-',
          // 'Supervisor': this.collections[i].supervisor_name ? this.collections[i].supervisor_name : '-',
          'Timestamp': format(
            this.collections[i].timestamp,
            'MM/DD/YYYY hh:mm a'
          ),

          'Verified': this.collections[i].verified ? 'Yes' : 'No',
          'Weight': GetNullOrUndefinedPipe.prototype.transform(this.collections[i].weight),
        });

      if (!isNullOrUndefined(this.isEntityTruck)) {
        this.reportObj.data[i]['Actor'] = this.collections[i].actor_name ? this.collections[i].actor_name : '-';
      } else {

        this.reportObj.data[i]['Truck'] = this.collections[i].entity_name ? this.collections[i].entity_name : '-';

      }
    }


    this.pdfReportObj.emit(this.reportObj);
    // this.getPDFReport();
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this.callObj)) {
      this.callObj.unsubscribe();
    }
  }

  getActivityDuration(row) {
    if (row.timestamp_2 && row.timestamp) {
      row['activity_duration'] = differenceInSeconds(new Date(row.timestamp_2), new Date(row.timestamp)) + 's';
      return row['activity_duration'];
    } else {
      return '-';
    }
  }
}

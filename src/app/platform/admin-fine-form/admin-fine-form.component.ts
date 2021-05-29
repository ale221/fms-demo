import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {JobStatusEnum, MaintenanceStatusEnum} from '../enum/iol-entity.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SwalService} from '../../core/services/swal.service';
import {FormService} from '../services/FormService';
import {isNullOrUndefined} from 'util';
import {DropDownItem} from '../data/model/dropdown-item';
import {DateUtils} from '../../core/date.utils';
import {ApiResponse, LoginApiResponse} from '../../core/model/api.response';
import {HttpController} from '../../core/services/loading-controller';
import swal from 'sweetalert2';
import {DatatableService} from '../services/datatable.service';
import {GotoPageService} from '../services/goto-page.service';
import {AppLoader} from '../data/model/app-loader';
import {HttpStatusCodeEnum} from '../../core/HttpStatusCodeEnum';
import {EntityStatusEnum, EntityType} from '../../core/enum/entity-type.enum';
import { BrandingService } from '../shared/services/branding.service';

@Component({
  selector: 'app-admin-fine-form',
  templateUrl: './admin-fine-form.component.html',
  styleUrls: ['./admin-fine-form.component.css'],

})
export class AdminFineFormComponent implements OnInit, OnChanges {

  issuedDatetime: Date;
  currentDate = new Date();
  formTitle = 'Create Fine';
  itemListTrucks = [];
  itemListDrivers = [];
  itemListMaintenanceStatus = [];
  selectedTruck;
  selectedDriver;
  selectedId;
  theme;

  public testVar;

  appLoader =  new AppLoader();
  fines: any[];
  temp: any[] = [];
  selectedRows: any[] = [];
  inputValue = '';
  public timestamp: Date;
  minDate: Date;
  maxValue:Date = new Date();
  EntityStatusEnum = EntityStatusEnum;
  // bsConfig: Partial<BsDatepickerConfig> = Object.assign({}, {
  //     containerClass: 'theme-dark-blue'},
  //   {dateInputFormat: 'YYYY-MM-DD'}
  // );
  bsValue: any = null;
  fineForm: FormGroup;
  errorMessages: string[];
  itemListMaintenanceType = [];
  notes;
  cost;

  settings = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: true,
    showCheckbox: false
    // classes: "form-control"
  };

  settings_readOnly = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: true,
    showCheckbox: false,
    disabled: true,
  };
  @ViewChild('closeForm') private closeForm;
  @Input() rowToEdit?;
  selectedMaintenance: any = null;

  MaintenanceStatusEnum = MaintenanceStatusEnum;

  @Output() submitForm: EventEmitter<any> = new EventEmitter<any>();


  constructor(public formBuilder: FormBuilder,
              private datatableService: DatatableService,
              public gotoService: GotoPageService,
              public swalService: SwalService,
              private brandingService: BrandingService,
              public formService: FormService) {
    this.fineForm = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      notes: [null],
      cost: [null, [Validators.required]],
      truck: [null],
      driver: [null, [Validators.required]],
      timestamp: [null, [Validators.required]],

    });

    this.theme = this.brandingService.styleObject();

  }
  ngOnInit() {
    this.maxValue = new Date();
    this.clearForm();
    this.getTrucks();
    this.getDrivers();
    if (this.rowToEdit) {
      // // console.log('inside the form component', this.rowToEdit);
      this.openEditModal(this.rowToEdit);
      this.formTitle = 'Edit Fine';
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    const name: SimpleChange = changes.rowToEdit;
    // console.log('prev value: ', name.previousValue);
    // console.log('got name: ', name.currentValue);
    this.rowToEdit = name.currentValue;
    this.openEditModal(name.currentValue);
  }
  getTrucks() {
    this.formService.getBinsData('get_entity_dropdown', {customer: 1, entity: EntityType.TRUCK})
      .subscribe(new class extends HttpController <LoginApiResponse<any[]>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            // console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any[]>): void {
            // console.log('trucks', apiResponse.response);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.itemListTrucks = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
        }(this)
      );
  }
  getDrivers() {
    this.formService.getBinsData('get_entity_dropdown', {customer: 1, entity: EntityType.DRIVER})
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            // console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              // console.log('driver list', apiResponse.response);
              this.context.itemListDrivers = apiResponse.response.map(
                item => new DropDownItem(item['id'], item['label'])
              );

            } else {
              // console.log(apiResponse.message);
            }
          }
        }(this)
      );

  }

  openEditModal(formValue) {
    // // console.log('edit modal', formValue);
    this.selectedDriver = formValue.driver;
    this.selectedTruck = formValue.truck;
    this.cost = (formValue.cost);
    this.notes = (formValue.notes);
    this.selectedId = (formValue.id);
    this.timestamp = (formValue.timestamp);
    this.fineForm.setValue({
      id:  this.selectedId,
      cost: this.cost,
      notes: this.notes,
      truck: this.selectedTruck ,
      driver: this.selectedDriver,
      timestamp: this.timestamp
    });
    // // console.log('after edit', this.selectedId, this.selectedDriver, this.selectedTruck);
  }
  onSubmit(formValue: Object) {
    // console.log('form', formValue, this.rowToEdit);
    if (this.validate()) {
      const id = this.selectedId;
      formValue['truck'] = this.selectedTruck ? this.selectedTruck : null;
      formValue['driver'] = this.selectedDriver;
      formValue['id'] = this.selectedId;
      formValue['timestamp'] = DateUtils.getUTCYYYYMMDDHHmmsstemp(this.timestamp.toDateString() + ' ' + this.timestamp.toTimeString());
      if (isNullOrUndefined(id)) {
        this.postFine(formValue);
      }
    } else {
      // console.log(this.errorMessages);
    }
  }
  patchFine(formValue) {
    // // console.log('editing', formValue);
    this.formService.addFine(formValue)
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            // console.log(errorMessage);
            this.context.swalService.getErrorSwal(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.closeForm.nativeElement.click();
              this.context.swalService.getSuccessSwal('Record has been edited successfully');
              this.context.submitForm.emit(true);
            }
            else {
              this.context.swalService.getErrorSwal(apiResponse.message);
              // this.context.submitForm.emit(false);
            }
          }
        }(this)
      );
  }
  postFine(formValue): void {
    // console.log('posting', formValue);
    this.formService.addFine(formValue)
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            // console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              // console.log(apiResponse);
              this.context.closeForm.nativeElement.click();
              this.context.swalService.getSuccessSwal('Record has been added');
              this.context.clearForm();
              this.context.submitForm.emit(true);
            }
            else {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
          }

        }(this)
      );

  }
  clearForm() {
    this.formTitle = 'Create Fine';
    this.fineForm.reset();

  }
  private closeFormButton() {
    this.submitForm.emit(false);


  }

  /*
  Purana Gand
  */
  inactiveRecord;
// openEditModal(maintenance) {
//   this.formTitle = 'Update Maintenance';
//   this.inactiveRecord = this.disableButton(maintenance);
//   // console.log(maintenance);
//   this.maintenanceForm.setValue({
//     id: maintenance.id,
//     maintenance_type: new DropDownItem(maintenance.maintenance_type_id, maintenance.maintenance_type),
//     truck: maintenance.assigned_truck ? new DropDownItem(maintenance.assigned_truck.id, maintenance.assigned_truck.name) : null,
//     end_datetime: new Date(maintenance['end_datetime']),
//     description: maintenance.description,
//   });
//   this.selectedMaintenance = maintenance;
// }
  showSwal(territory) {
    swal({
      title: 'What do you want to do with ' + territory.name + ' ?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: (territory.status !== this.EntityStatusEnum[this.EntityStatusEnum.Inactive]),
      showCloseButton: true,
      confirmButtonText: 'Delete Record',
      cancelButtonText: 'Mark as Inactive',
      confirmButtonClass: 'btn btn-sm btn-danger margin-5',
      cancelButtonClass: 'btn btn-sm btn-warning margin-5',
      buttonsStyling: false,
      allowOutsideClick: true,
    }).then((result) => {
      // Delete Record
      if (result.value) {
        this.deleteMaintenance([territory.id], EntityStatusEnum.Delete, 'Record has been deleted successfully');
      }
      //  Inactive
      else if (
        result.dismiss.toString() === 'cancel') {
        this.deleteMaintenance([territory.id], EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');
      }
    });

  }
// Delete bin
  deleteMaintenance(binId, actionType, message?)  {
    const params = {};
    params['id_list'] =  (binId);
    params['status'] =  actionType;
    this.formService.deleteData(params)
      .subscribe(new class extends HttpController <ApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            // console.log(errorMessage);
            this.context.swalService.getErrorSwal(errorMessage);
          }

          onNext(apiResponse: ApiResponse<any>): void {
            this.context.swalService.getSuccessSwal(message);
            this.context.getMaintenances();
            this.context.inputValue = '';
            this.context.selectedRows = [];
          }

        }(this)
      );
  }
  validate(): boolean {

    const isValid = true;
    // this.errorMessages = [];
    // if (this.maintenanceForm.get('name').hasError('required')) {
    //   this.errorMessages.push('Name ' + ErrorMessage.REQUIRED);
    //   isValid = false;
    // }
    // if (this.maintenanceForm.get('name').hasError('isAlphabetsAndNumbers')) {
    //   this.errorMessages.push('Name ' + ErrorMessage.IS_ALPHABETS_AND_NUMBERS);
    //   isValid = false;
    // }
    return isValid;
  }


  async showSwalForMultiple() {
    const arr = [];
    const id_list = [];
    let showInactive = false;
    this.selectedRows.forEach(item => {
      arr.push(item.name);
      id_list.push(item.id);
      if (item.status !== this.EntityStatusEnum[this.EntityStatusEnum.Inactive]) { showInactive = true; }
    });
    swal({
      title: 'What do you want to do with ' + (arr.length > 3 ? arr.length + ' records' : arr)  + ' ?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: showInactive,
      showCloseButton: true,
      allowOutsideClick: true,
      confirmButtonText: 'Delete Record',
      cancelButtonText: 'Mark as Inactive',
      confirmButtonClass: 'btn btn-sm btn-danger margin-5',
      cancelButtonClass: 'btn btn-sm btn-warning margin-5',
      buttonsStyling: false,
    }).then((result) => {
      // Delete Record
      if (result.value) {

        this.deleteMaintenance(id_list, EntityStatusEnum.Delete, 'Record has been deleted successfully');

      }
      //  Inactive
      else if (
        result.dismiss.toString() === 'cancel') {

        this.deleteMaintenance(id_list, EntityStatusEnum.Inactive, 'Record has been marked inactive successfully');

      }
    });

  }

  onSelect({ selected }) {
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  updateFilter(event) {
    this.fines = this.datatableService.updateFilter(event.target.value, this.temp);

  }

  disableButton(row) {
    return (
      (
        row.job_status_id === this.MaintenanceStatusEnum.MAINTENANCE_COMPLETED ||
        row.status_id === this.EntityStatusEnum.Inactive
      )
    );
  }

  getClass(status_id) {
    if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_COMPLETED) {
      return 'label-success';
    }
    if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_OVER_DUE) {
      return 'label-danger';
    } if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_DUE) {
      return 'label-warning';
    }


    return 'label-default';

  }


}

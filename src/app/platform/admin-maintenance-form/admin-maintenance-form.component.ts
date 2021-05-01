import {
  AfterContentInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MaintenanceStatusEnum} from '../enum/iol-entity.enum';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SwalService} from '../../core/services/swal.service';
import {FormService} from '../services/FormService';
import {isNullOrUndefined} from 'util';
import {LoginApiResponse} from '../../core/model/api.response';
import {HttpController} from '../../core/services/loading-controller';
import {DatatableService} from '../services/datatable.service';
import {GotoPageService} from '../services/goto-page.service';
import {AppLoader} from '../data/model/app-loader';
import {HttpStatusCodeEnum} from '../../core/HttpStatusCodeEnum';
import {EntityStatusEnum, EntityType} from '../../core/enum/entity-type.enum';
import {MaintenanceService} from '../services/mainenance-service.service';
import {BsModalRef} from 'ngx-bootstrap/modal';
import {PrimengDropdownItem} from '../data/model/primng-dropdown-item';
import {AuthService} from '../../core/services/auth.service';
import {User} from '../../core/model/user';
import {UserRoleEnum} from '../enum/user-role.enum';
import { BrandingService } from '../shared/services/branding.service';
import { DateUtils } from 'src/app/Utils/DateUtils';

@Component({
  selector: 'app-admin-maintenance-form',
  templateUrl: './admin-maintenance-form.component.html',
  styleUrls: ['./admin-maintenance-form.component.css'],
})
export class AdminMaintenanceFormComponent implements OnInit, AfterContentInit {
  startDatetime: Date;
  endDatetime: Date;
  currentDate = new Date();
  formTitle;
  itemListTrucks = [];
  itemListDrivers = [];
  itemListTechnicians = [];
  itemListMaintenanceStatus = [];
  selectedTruck;
  selectedDriver;
  selectedId;
  disableSaveButton = false;

  theme;
  appLoader = new AppLoader();
  maintenances: any[];
  temp: any[] = [];
  selectedRows: any[] = [];
  inputValue = '';
  public end_datetime: Date;
  minDate: Date;
  maintenanceForm: FormGroup;
  errorMessages: string[];
  itemListMaintenanceType = [];
  selectedMaintenanceStatus;
  selectedMaintenanceType;

  settings = {
    singleSelection: true,
    text: 'Select an Option',
    enableSearchFilter: true,
    showCheckbox: false
  };
  MaintenanceStatusEnum = MaintenanceStatusEnum;


  preFilledData;
  user: User;
  isUserTechnician;

  @ViewChild('closeForm') private closeForm;
  @Input() rowToEdit?;
  @Output() submitForm: EventEmitter<any> = new EventEmitter<any>();


  constructor(public formBuilder: FormBuilder,
              private datatableService: DatatableService,
              public gotoService: GotoPageService,
              public bsModalRef: BsModalRef,
              public swalService: SwalService,
              public authService: AuthService,
              public maintenaceService: MaintenanceService,
              private brandingService: BrandingService,
              public formService: FormService) {
    this.maintenanceForm = this.formBuilder.group({
      id: [{value: null, disabled: isNullOrUndefined(this.preFilledData)}],
      maintenance_type: [null, [Validators.required]],
      status: [null, [Validators.required]],
      truck: [null, [Validators.required]],
      driver: [null],
      technician: [null],
      end_datetime: [null, [Validators.required]],
      start_datetime: [null, [Validators.required]],
    });
    this.theme = this.brandingService.styleObject();
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.isUserTechnician = this.user.user_role_id === UserRoleEnum.WorkshopTechnician;
  }

  ngAfterContentInit(): void {
    this.getTrucks();
    this.getDrivers();
    this.getTechnicians();
    this.getMaintenanceTypes();
    this.getMaintenanceStatus();
    if (!isNullOrUndefined(this.preFilledData)) {
      this.startDatetime = new Date(this.preFilledData.start_datetime);
      this.maintenanceForm.setValue({
        id: this.preFilledData.id,
        maintenance_type: this.preFilledData.maintenance_type,
        status: this.preFilledData.status,
        truck: this.preFilledData.device,
        driver: this.preFilledData.driver,
        technician: this.preFilledData.technician,
        end_datetime: new Date(this.preFilledData.end_datetime),
        start_datetime: new Date(this.preFilledData.start_datetime),
      });

    }
  }

  getMaintenanceTypes() {
    this.formService.getOptions('dropdown_data', {option_key: 'iof_maintenance'})
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.itemListMaintenanceType = apiResponse['response']['option_values'].map(
            item => ({id: item['id'], name: item['label']})
          );
        }
      })
  }

  getMaintenanceStatus() {
    const params = { option_key: 'iof_maintenance_status' };
    this.formService.getOptions('dropdown_data', params)
    .subscribe(apiResponse => {
      this.itemListMaintenanceStatus = apiResponse['response']['option_values'].map(
        item => ({id: item['id'], name: item['label']})
      );
    });
  }

  getTrucks() {
    this.formService.getBinsData('get_entity_dropdown', {customer: 1, entity: EntityType.TRUCK})
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.itemListTrucks = apiResponse['response'].map(
            item => ({id: item['id'], name: item['label']})
          );
        }
      })
  }

  getDrivers() {
    this.formService.getBinsData('get_entity_dropdown', {customer: 1, entity: EntityType.DRIVER})
    .subscribe(apiResponse => {
      if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
        this.itemListDrivers = apiResponse['response'].map(
          item => ({id: item['id'], name: item['label']})
        );

      }
    })
  }

  getTechnicians() {
    this.formService.getBinsData('get_entity_dropdown', {customer: 1, entity: EntityType.Workshop_Technician})
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.itemListTechnicians = apiResponse['response'].map(
            item => ({id: item['id'], name: item['label']})
          );
        }
      })
  }


  onSubmit(formValue: Object) {
    this.disableSaveButton = true;
    console.log('form', formValue);
    let id = null;
    if (this.validate()) {
      if (!isNullOrUndefined(this.preFilledData)) {
        id = this.preFilledData.id;
      }
      formValue['action'] = formValue['status'];
      formValue['start_datetime'] = DateUtils.getYYYYMMDD(formValue['start_datetime']);
      formValue['start_datetime'] += ' 00:00:00';
      formValue['end_datetime'] = DateUtils.getYYYYMMDD(formValue['end_datetime']);
      formValue['end_datetime'] += ' 00:00:00';
      if (isNullOrUndefined(id)) {
        this.postMaintenance(formValue);
      } else {
        formValue['id'] = id;
        this.patchMaintenance(formValue);
      }
    } else {
      console.log(this.errorMessages);
    }
  }

  patchMaintenance(formValue) {
    this.maintenaceService.patchMaintenance(formValue)
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(apiResponse['message']);
          this.bsModalRef.hide();
        } else {
          this.swalService.getErrorSwal(apiResponse['message']);
        }
        this.submitForm.emit(apiResponse['status'] === HttpStatusCodeEnum.Success);
      })
  }

  postMaintenance(formValue): void {
    this.maintenaceService.postMaintenance(formValue)
      .subscribe(apiResponse => {
        if (apiResponse['status'] === HttpStatusCodeEnum.Success) {
          this.swalService.getSuccessSwal(apiResponse['message']);
          this.bsModalRef.hide();
        } else {
          this.swalService.getErrorSwal(apiResponse['message']);
        }
        this.submitForm.emit(apiResponse['status'] === HttpStatusCodeEnum.Success);
      })
  }


  validate(): boolean {

    const isValid = true;
    return isValid;
  }


  onSelect({selected}) {
    this.selectedRows.splice(0, this.selectedRows.length);
    this.selectedRows.push(...selected);
  }

  updateFilter(event) {
    this.maintenances = this.datatableService.updateFilter(event.target.value, this.temp);

  }

  disableButton(row) {
    return (
      (
        row.job_status_id === this.MaintenanceStatusEnum.MAINTENANCE_COMPLETED ||
        row.status_id === EntityStatusEnum.Inactive
      )
    );
  }

  getClass(status_id) {
    if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_COMPLETED) {
      return 'label-success';
    }
    if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_OVER_DUE) {
      return 'label-danger';
    }
    if (status_id === this.MaintenanceStatusEnum.MAINTENANCE_DUE) {
      return 'label-warning';
    }
    return 'label-default';
  }


  closeModal() {
    this.maintenanceForm.reset();
    this.bsModalRef.hide();
  }


}

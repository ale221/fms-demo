import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GotoPageService} from '../services/goto-page.service';
import {SwalService} from '../../core/services/swal.service';
import {MaintenanceService} from '../services/mainenance-service.service';
import {FormService} from '../services/FormService';
import {HttpController} from '../../core/services/loading-controller';
import {LoginApiResponse} from '../../core/model/api.response';
import {HttpStatusCodeEnum} from '../../core/HttpStatusCodeEnum';
import {DropDownItem} from '../data/model/dropdown-item';
import {isNullOrUndefined} from 'util';
import {MaintenanceStatusEnum} from '../enum/iol-entity.enum';
import {CustomValidators} from '../../core/custom.validator';
import { BrandingService } from '../shared/services/branding.service';


@Component({
  selector: 'app-maintenance-data-form',
  templateUrl: './maintenance-data-form.component.html',
  styleUrls: ['./maintenance-data-form.component.css']
})
export class MaintenanceDataFormComponent implements OnInit {

  maintenanceDataForm: FormGroup;
  selectedCostType;
  selectedCost;
  itemListCostType = [];

  formTitle;
  disableSaveButton = false;

  theme;
  @Input() maintenance;
  @ViewChild('closeForm') private closeForm;
  @Output() submitForm: EventEmitter<any> = new EventEmitter<any>();

  constructor(public formBuilder: FormBuilder,
              public gotoService: GotoPageService,
              public swalService: SwalService,
              public maintenanceService: MaintenanceService,
              private brandingService: BrandingService,
              public formService: FormService) {
    this.maintenanceDataForm = this.formBuilder.group({
      id: [{value: null, disabled: true}],
      cost: [null, [Validators.min(1), CustomValidators.isNumbers]],
      cost_type: [null],
    });

    this.setControlTypeValidators();

    this.theme = this.brandingService.styleObject();

  }

  ngOnInit() {
    this.maintenanceDataForm.reset();
    this.getMaintenanceDataStatus();

  }

  setControlTypeValidators() {
    const costControl = this.maintenanceDataForm.get('cost');
    const costTypeControl = this.maintenanceDataForm.get('cost_type');

    // costControl.valueChanges
    //   .subscribe(valueOfCost => {
    //     if (!isNullOrUndefined(valueOfCost)) {
    //       console.log('valueOfCost', valueOfCost.toString().indexOf('e') > -1);
    //     }
    //
    //   });

    costTypeControl.valueChanges
      .subscribe(valueOfCostType => {
        if (valueOfCostType) {
          costControl.enable();

          costControl.setValidators([Validators.required]);
          costControl.updateValueAndValidity();
        } else {
          costControl.disable();
        }
      });
  }

  onSubmit(formValue) {
    this.disableSaveButton = true;
    if (this.validate(formValue)) {
      const id = this.maintenanceDataForm.getRawValue().id;

      formValue['truck'] = this.maintenance['truck'];
      formValue['driver'] = this.maintenance['driver'];
      formValue['maintenance'] = this.maintenance['id'];
      formValue['action'] = MaintenanceStatusEnum.ADDITION_OF_COST;
      console.log(formValue);
      if (isNullOrUndefined(id)) {
        this.postMaintenance(formValue);
      }
    }
  }

  private getMaintenanceDataStatus() {
    this.formService.getOptions('dropdown_data', {option_key: 'iof_maintenance_data_status'})
      .subscribe(new class extends HttpController <LoginApiResponse<any[]>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any[]>): void {
            console.log('maintenance status', apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.itemListCostType = apiResponse.response['option_values'].map(
                item => new DropDownItem(item['id'], item['label'])
              );
            }
          }
        }(this)
      );
  }

  private postMaintenance(formValue): void {
    console.log('posting', formValue);
    this.maintenanceService.postMaintenanceData(formValue)
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
            this.context.disableSaveButton = false;
          }

          onError(errorMessage: string, err: any) {
            // do
            this.context.swalService.getErrorSwal(errorMessage);
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.swalService.getSuccessSwal('Record has been added');

              // this.context.clearForm();
              this.context.submitForm.emit(true);
            } else {
              this.context.swalService.getErrorSwal(apiResponse.message);
            }
            this.context.submitForm.emit(apiResponse.status === HttpStatusCodeEnum.Success);
            this.context.closeModal();

          }

        }(this)
      );

  }


  closeModal() {
    this.maintenanceDataForm.reset();
    this.closeForm.nativeElement.click();

    // this.bsModalRef.hide();
  }


  private validate(formValue) {
    if (!isNullOrUndefined(this.selectedCostType) && isNullOrUndefined(formValue['cost'])) {
      this.maintenanceDataForm.controls['cost'].setValidators(Validators.required);
      this.maintenanceDataForm.updateValueAndValidity();
      return false;
    }
    return true;
  }
}

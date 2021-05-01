import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {EntityType} from '../../../core/enum/entity-type.enum';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {DropDownItem} from '../../data/model/dropdown-item';
import {FormService} from '../../services/FormService';
import {AppLoader} from '../../data/model/app-loader';
import {isNullOrUndefined} from 'util';
import {PrimengDropdownItem} from '../../data/model/primng-dropdown-item';

@Component({
  selector: 'app-area-dropdown',
  templateUrl: './area-dropdown.component.html',
  styleUrls: ['./area-dropdown.component.css']
})
export class AreaDropdownComponent implements OnInit, AfterViewInit {

  area_list = [];
  areaLoader = new AppLoader();
  selectedValue: any = null;

  @Input() disableRecord = false;
  @Input() showLabel = false;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();

  constructor(private formService: FormService) {
  }

  ngOnInit() {
  }


  ngAfterViewInit(): void {
    this.getAreas();
  }

  onAreaChange(event) {
    console.log(event);
    this.valueChanged.emit(event);

  }


  getAreas() {
    this.formService.getBinsData('get_entity_dropdown', {entity: EntityType.AREA})
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
            this.context.loader_flag = false;
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            console.log('areas', apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              if (!isNullOrUndefined(apiResponse.response)) {
                this.context.area_list = apiResponse.response.map(
                  item => new PrimengDropdownItem(item['id'], item['label'])
                );
              }
            }
          }
        }(this.areaLoader)
      );
  }


}

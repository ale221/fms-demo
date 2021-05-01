import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {AppLoader} from '../../data/model/app-loader';
import {EntityType} from '../../../core/enum/entity-type.enum';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {DropDownItem} from '../../data/model/dropdown-item';
import {FormService} from '../../services/FormService';
import {PrimengDropdownItem} from '../../data/model/primng-dropdown-item';

@Component({
  selector: 'app-location-dropdown',
  templateUrl: './location-dropdown.component.html',
  styleUrls: ['./location-dropdown.component.css']
})
export class LocationDropdownComponent implements OnInit, AfterViewInit, OnChanges {

  location_list = [];
  locationLoader = new AppLoader();

  @Input() disableRecord = false;
  @Input() showLabel = false;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();
  selectedValue: any;

  constructor(private formService: FormService) {
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    this.getLocations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedValue = null;
  }

  getLocations() {
    this.formService.getBinsData('get_entity_dropdown', {entity: EntityType.LOCATION})
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
            this.context.loader_flag = false;
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            console.log('locations', apiResponse);
            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              if (apiResponse.response !== undefined) {
                this.context.location_list = apiResponse.response.map(
                  item => new PrimengDropdownItem(item['id'], item['label'])
                );
              }
            }
            this.context.locations_loader_flag = false;
          }
        }(this.locationLoader)
      );
  }


  onLocationChange(event) {
    this.valueChanged.emit(event);
  }

}

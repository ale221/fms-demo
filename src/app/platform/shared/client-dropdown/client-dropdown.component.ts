import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EntityType } from '../../../core/enum/entity-type.enum';
import { HttpController } from '../../../core/services/loading-controller';
import { LoginApiResponse } from '../../../core/model/api.response';
import { HttpStatusCodeEnum } from '../../../core/HttpStatusCodeEnum';
import { FormService } from '../../services/FormService';
import { PrimengDropdownItem } from '../../data/model/primng-dropdown-item';
import { AppLoader } from '../../data/model/app-loader';
import { GotoPageService } from '../../services/goto-page.service';

@Component({
  selector: 'app-client-dropdown',
  templateUrl: './client-dropdown.component.html',
  styleUrls: ['./client-dropdown.component.css']
})
export class ClientDropdownComponent implements OnInit {

  client_list = [];
  clientLoader = new AppLoader();

  @Input() markAsRequired = false;
  @Input() multiSelect = false;
  @Input() disableRecord = false;
  @Input() showLabel = false;
  @Input() selected: number;
  @Output() valueChanged: EventEmitter<any> = new EventEmitter<any>();


  loadingTemplate = `<span class="pull-right"><img src="/assets/images/iol/label-loader.gif" height="25px" width="25px"></span>`;


  selectedValue = [];


  constructor(private formService: FormService, private gotoService: GotoPageService) {
  }

  ngOnInit() {
    this.getClients();
    // console.log(this.selected);
  }

  getClients() {
    this.formService.getBinsData('get_entity_dropdown', { entity: EntityType.CLIENT })
      .subscribe(new class extends HttpController<LoginApiResponse<any>> {
        onComplete(): void {
        }

        onError(errorMessage: string, err: any) {
          // do
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any>): void {
          console.log('clients', apiResponse);

          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.client_list = apiResponse.response.map(
              item => new PrimengDropdownItem(item['id'], item['label'])
            );
            console.log(this.context.client_list);
            this.context.selected = 88;
          } else {
            console.log(apiResponse.message);
          }
        }
      }(this)
      );

  }


  onClientChange(event) {
    this.valueChanged.emit(event);
  }


}

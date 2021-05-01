import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {HttpController} from '../../../core/services/loading-controller';
import {LoginApiResponse} from '../../../core/model/api.response';
import {HttpStatusCodeEnum} from '../../../core/HttpStatusCodeEnum';
import {PrimengDropdownItem} from '../../data/model/primng-dropdown-item';
import {FormService} from '../../services/FormService';
import {GotoPageService} from '../../services/goto-page.service';
import {EntityService} from '../../services/entity.service';
import {AppLoader} from '../../data/model/app-loader';

@Component({
  selector: 'app-contracts-dropdown',
  templateUrl: './contracts-dropdown.component.html',
  styleUrls: ['./contracts-dropdown.component.css']
})
export class ContractsDropdownComponent implements OnInit, OnChanges, AfterViewInit {


  selectedValue = [];
  contract_list = [];

  appLoader = new AppLoader();
  @Input() disableRecord = false;
  @Input() showLabel = false;
  @Input() client_id?;
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();

  constructor(private formService: FormService, private entityService: EntityService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log(changes['client_id']['currentValue']);
    if ('client_id' in changes) {
      this.appLoader.visibility = true;
      this.getContracts(changes['client_id']['currentValue']);
    } else {
      console.log('here');
      this.contract_list = [];
      this.selectedValue = [];
      this.selected.emit([]);

    }
  }

  getContracts(client_id) {
    this.selectedValue = [];
    this.contract_list = [];
    const params = new FormData();

    if(typeof (client_id) == 'number'){
      params.append('client', client_id.toString());
    }
    else {
      for (let i = 0; i < client_id.length; i++) {
        params.append('client', client_id[i]);
      }
    }

    console.warn(params);

    this.entityService.getContractsOfClient(params)
      .subscribe(new class extends HttpController <LoginApiResponse<any>> {
          onComplete(): void {
          }

          onError(errorMessage: string, err: any) {
            // do
            console.log(errorMessage);
          }

          onNext(apiResponse: LoginApiResponse<any>): void {
            console.log(apiResponse);

            if (apiResponse.status === HttpStatusCodeEnum.Success) {
              this.context.contract_list = apiResponse.response.map(
                item => new PrimengDropdownItem(item['id'], item['label'])
              );

            } else {
              console.log(apiResponse.message);
            }
          }
        }(this.appLoader)
      );
  }

  onContractChange(client) {
    // this.param_contract_list = [];
    // for (let i = 0; i < this.selected_contract_list.length; i++) {
    //   this.param_contract_list.push(this.selected_contract_list[i].id);
    // }

    this.selected.emit(client);
  }


}

import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {isNullOrUndefined} from '@swimlane/ngx-datatable';
import { NgxChartResponse } from '../../data/model/ngx-chart-response';
import { EntityType } from 'src/app/core/enum/entity-type.enum';
import { DateUtils } from 'src/app/Utils/DateUtils';
import { AppLoader } from '../../data/model/app-loader';
import { VariableDropDown } from '../../data/model/variable-dropdown';
import { TruckService } from '../../services/truck.service';
import { DimensionTypeEnum } from '../../enum/dimension-type.enum';
import { SourceTypeEnum } from '../../enum/source-type.enum';


@Component({
  selector: 'app-grouped-vertical-bar-chart',
  templateUrl: './grouped-vertical-bar-chart.component.html',
  styleUrls: ['./grouped-vertical-bar-chart.component.css']
})
export class GroupedVerticalBarChartComponent implements  OnChanges, OnInit{
  @Input() isDropDownHidden = false;
  @Input() xAxisLabel: string;
  @Input() entityId: number;
  @Input() yAxisLabel: string;
  @Input() legendTitle: string;
  @Input() colorScheme: object;

  @Input() entityName?: string;


  @Input() sensorsLabelObj? = {'volume': 'Ltr', 'temperature': 'Centigrades', 'speed': 'km/h'};


  view: any[] = [1000, 280];
  // stockChart: StockChart;

  barPadding = 16;
  groupPadding = 32;
  max_level = 6;
  current_level = 1;
  ngxChartResponse: NgxChartResponse[] = [];
  isLoading = false;

  isHideBackButton = true;
  stack: any = [];
  stackSeleted: any = [];
  @Input() params?: any = {
    type_id: EntityType.TRUCK,
    tzinfo: DateUtils.getTimezone(),
    time: '',
    variable: [],
  };

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  showAxisGrid = true;


  appLoader = new AppLoader();

  @Input() variableDropdown: VariableDropDown = new VariableDropDown([]);
  variableDropdownSettings = {};
  aggregationDropdownSettings = {};

  constructor(private truckService: TruckService) {
    // this.stockChart = new StockChart({
    //   rangeSelector: {
    //     selected: 1
    //   },

    //   title: {
    //     text: 'Truck'
    //   },
    //   series: []
    // });

    this.changeButtonStatus();
  }

  onSelect(event) {
    if (typeof event === 'string') {
      return;
    }
    this.onClicked(event);
  }

  ngOnInit() {
    this.initVariableDropdown();
    this.initAggregationDropdown();
    if (!isNullOrUndefined(this.entityId)) {
      this.params.entity_id = this.entityId;
      // this.generate();
    }
    this.yAxisLabel = this.sensorsLabelObj[this.variableDropdown.selectedVariables[0].id];
  }

  initVariableDropdown() {
    this.variableDropdownSettings = {
      singleSelection: true,
      text: 'Select Items',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      classes: "myclass ng-my-select",
      badgeShowLimit: 1


      // classes: "myclass custom-class"
    };
  }

  initAggregationDropdown() {
    this.aggregationDropdownSettings = {
      singleSelection: false,
      text: 'Select Items',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: false,
      enableCheckAll: false,
      classes: "myclass ng-my-select",
      badgeShowLimit: 3


      // classes: "myclass custom-class"
    };
  }

  onItemSelect(item: any) {

  }

  OnItemDeSelect(item: any) {
    // console.log(item);
    if (this.variableDropdown.selectedVariables.length === 0) {
      this.variableDropdown.selectedVariables.push(item);
    } else if (this.variableDropdown.selectedVariables[0].selectedAggregations.length === 0) {
      this.variableDropdown.selectedVariables[0].selectedAggregations.push(item);
    }

  }

  onSelectAll(items: any) {
    // // console.log(items);
  }

  onDeSelectAll(items: any) {
    // // console.log(items);
  }

  getTruckDrillReport(): void {
    switch (this.current_level) {
      case 1:
        this.params.dimension = DimensionTypeEnum.YEAR;
        break;
      case 2:
        this.params.dimension = DimensionTypeEnum.MONTH;
        break;
      case 3:
        this.params.dimension = DimensionTypeEnum.DAY;
        break;
      case 4:
        this.params.dimension = DimensionTypeEnum.HOUR;
        break;
      case 5:
        this.params.dimension = DimensionTypeEnum.MINUTE;
        break;
      case 6:
        this.params.dimension = DimensionTypeEnum.SECOND;
        break;
    }
    this.params.time = this.getTime();
    this.isLoading = true;
    this.truckService.getEntityDrillReport(
      this.params
    ).subscribe (data => {
      if (data.status) {
        this.ngxChartResponse = data.response;

        this.changeButtonStatus();
      }
      this.isLoading = false;
    });
  }

  changeButtonStatus() {
    this.isHideBackButton = this.stack.length === 0 ? true : false;
    if (this.current_level === 1) {
      this.barPadding = 16;
      this.groupPadding = 48;
      this.xAxisLabel = 'Years';
    } else if (this.current_level === 2) {
      this.barPadding = 8;
      this.groupPadding = 16;
      this.xAxisLabel = this.getTime() + ' Months';
    } else if (this.current_level === 3) {
      this.barPadding = 4;
      this.groupPadding = 6;
      this.xAxisLabel = this.getTime() + ' Days';
    } else if (this.current_level === 4) {
      this.barPadding = 4;
      this.groupPadding = 6;
      this.xAxisLabel = this.getTime() + ' Hours';
    } else if (this.current_level === 5) {
      this.barPadding = 1;
      this.groupPadding = 1;
      this.xAxisLabel = this.getTime() + ' Minutes';
    } else if (this.current_level === 6) {
      this.barPadding = 4;
      this.groupPadding = 6;
      this.xAxisLabel = this.getTime() + ' Seconds';
    }
  }

  onClicked(value) {
    if (this.max_level === this.current_level) {
      return;
    }
    this.stack.push(this.ngxChartResponse);
    this.stackSeleted.push(value);
    this.changeButtonStatus();
    this.current_level++;
    this.getTruckDrillReport();
  }

  onBackButtonClicked() {
    this.ngxChartResponse = this.stack.pop();
    this.stackSeleted.pop();
    this.current_level--;
    this.changeButtonStatus();

  }

  resetGraph() {
    this.ngxChartResponse = [];
    this.stack = [];
    this.stackSeleted = [];
    this.current_level = 1;
    this.changeButtonStatus();

  }

  getTime(): string {
    if (this.stackSeleted.length === 0) {
      return '';
    }
    let time = '';
    for (let i = 0; i < this.stackSeleted.length; i++) {
      if (i === 0) {
        time = this.stackSeleted[i].series;
      } else if (i === 1) {
        time = time + '-' + this.stackSeleted[i].series;
      } else if (i === 2) {
        time = time + '-' + this.stackSeleted[i].series;
      } else if (i === 3) {
        time = time + ' ' + this.stackSeleted[i].series;
      } else if (i === 4) {
        time = time.substr(0, time.length - 9);
        time = time + ' ' + this.stackSeleted[i].series;
      }
    }
    // // console.log(this.stackSeleted[this.stackSeleted.length - 1]);
    // // console.log(time);
    return time;
  }

  generate() {
    this.resetGraph();
    this.params.variable = [];
    this.variableDropdown.selectedVariables.forEach((e) => {
      e.selectedAggregations.forEach((ee, i) => {
        this.params.variable.push(
          JSON.stringify({
            variable: e.id,
            aggregation: Number.parseInt(e.selectedAggregations[i].id),
            source: SourceTypeEnum.HYPERNET_POST_DATA
          }));
      });
    });
    this.yAxisLabel = this.sensorsLabelObj[this.variableDropdown.selectedVariables[0].id];
    this.getTruckDrillReport();
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (!isNullOrUndefined(changes.entityId) && !isNullOrUndefined(changes.entityId.currentValue)) {
    //   this.params.entity_id = changes.entityId.currentValue;
    //   this.generate();
    // }
    // else {
    //   this.ngxChartResponse = [];
    // }
  }
}

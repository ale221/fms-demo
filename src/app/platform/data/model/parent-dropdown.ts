// Created by soban on 09-08-2017.

import {DropDownItem} from './dropdown-item';

export class ParentDropDown {
  id: string;
  itemName: string;
  aggregations: DropDownItem[];
  selectedAggregations: DropDownItem[];
  code: string;
  name: string;


  constructor(id: string, itemName: string, aggregations: DropDownItem[]) {
    this.id = id;
    this.itemName = itemName;
    this.code = id;
    this.name = itemName;
    this.aggregations = aggregations;
    if (aggregations.length > 0) {
      this.selectedAggregations = [aggregations[0]];
    }  
  }
}

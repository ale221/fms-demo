// Created by soban on 09-08-2017.

import {ParentDropDown} from './parent-dropdown';

export class VariableDropDown {
  variables: ParentDropDown[];
  selectedVariables: ParentDropDown[] = [];


  constructor(variables: ParentDropDown[], selectedVariables?: number[]) {
    this.variables = variables;
    if (selectedVariables && selectedVariables.length > 0) {
      selectedVariables.forEach((e) => {
        this.selectedVariables.push(this.variables[e]);
      });
    } 
    else if (variables.length > 0) {
      this.selectedVariables = [variables[0]];
    }
    
  }
}

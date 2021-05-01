// Created by soban on 09-08-2017.

export class DropDownItem {
  id: string;
  itemName: string;
  code: string;
  name: string;
  label: string;
  value: string;


  constructor(id, itemName: string) {
    this.id = id;
    this.itemName = itemName;
    this.code = id;
    this.name = itemName;
    this.label = itemName;
    this.value = id;
  }


}

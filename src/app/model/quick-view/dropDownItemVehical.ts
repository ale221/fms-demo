// Created by soban on 09-08-2017.

export class DropDownItemVehicle {
  id: string;
  itemName: string;
  code: string;
  name: string;
  label: string;
  value: string;
  entity_sub_type: number;


  constructor(id, itemName: string, entity_sub_type: number) {
    this.id = id;
    this.itemName = itemName;
    this.code = id;
    this.name = itemName;
    this.label = itemName;
    this.value = id;
    this.entity_sub_type = entity_sub_type;
  }


}

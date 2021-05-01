// Created by soban on 09-08-2017.

import {Item} from './item';

export class IolDashboardCard {
  icon: string;
  entityTypeId: number;
  image: string;
  title: string;
  count: number;
  details: Item[];


  constructor(icon?: string, entityTypeId?: number, image?: string, title?: string, count?: number, details?: Item[]) {
    this.icon = icon;
    this.entityTypeId = entityTypeId;
    this.image = image;
    this.title = title;
    this.count = count;
    this.details = details;
  }
}

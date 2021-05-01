import { Injectable } from '@angular/core';

export interface BrandingInterface {
  color: string;
  'border-color': string;
  'background-color': string;
}

export interface HeadingInterface {
  color: string;
}



@Injectable({
  providedIn: 'root'
})
export class BrandingService {

  // themeBranding = {
  //   primary_color: '#e60000',
  //   font_color: '#fff',
  // }

  constructor() {
  }

  inititalizeBranding() {
    let theme = JSON.parse(localStorage.getItem('user'));
    theme = theme.customer;
    localStorage.setItem('theme', JSON.stringify(theme));
  }

  styleObject() {
    let branding = {} as BrandingInterface;
    let theme = JSON.parse(localStorage.getItem('user'));
    if (theme) {
      theme = theme.customer;
      branding = {
        'background-color': theme.primary_color ? theme.primary_color : '#e60000',
        'border-color': theme.primary_color ? theme.primary_color : '#e60000',
        color: theme.font_color ? theme.font_color : '#fff'
      }
      return branding;
    }
  }

  sidebarStyleObject() {
    let heading = {} as HeadingInterface;
    let theme = JSON.parse(localStorage.getItem('user'));
    if (theme) {
      theme = theme.customer;
      heading = {
        color: theme.primary_color ? theme.primary_color : '#e60000'
      }
      return heading;
    }
  }


  //incase we need to change header's color
  headerStyleObject() {
    let heading = {} as HeadingInterface;
    let theme = JSON.parse(localStorage.getItem('user'));
    if (theme) {
      theme = theme.customer;
      heading = {
        color: theme.primary_color ? theme.primary_color : '#e60000'
      }
      return heading;
    }
  }

}

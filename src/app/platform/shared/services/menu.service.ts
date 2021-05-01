import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor() {
  }

  inititalizeMenu() {
    let menu = JSON.parse(localStorage.getItem('user'));
    menu = menu.menuaccess;
    localStorage.setItem('menu', JSON.stringify(menu));
  }

  menuObject() {
    let menu = JSON.parse(localStorage.getItem('user'));
    if (menu) {
      menu = menu.menuaccess;
      return menu;
    }
  }
}

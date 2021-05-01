// Created by soban on 09-08-2017.
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from '../model/user';
import {iolModules} from "../model/module";
import {isNullOrUndefined} from "util";
import { StorageService } from 'src/app/Services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private route: Router, public localStorageService: StorageService) {
  }

  setUser(user: User): void {
    if(!isNullOrUndefined(user))
      this.localStorageService.store('user', user);
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem('user')) as User;
  }

  unsetUser(): void {
    this.localStorageService.clear('user');
  }

  isLoggedIn(): boolean {
    if(localStorage.getItem('user')) {
      const user: User = JSON.parse(localStorage.getItem('user')) as User;
      if (user && user.token) {
        return true;
      }
    }
    return false;
  }

  getToken(): string {
    const user: User = JSON.parse(localStorage.getItem('user')) as User;
    if (user && user.token) {
      return 'Token ' + user.token;
    }
    return null;
  }


  isCaretaker() {
    const caretaker_id = [4, 5];
    const user: User = this.getUser();
    if (caretaker_id.indexOf(user.user_role_id) !== -1) {
      return true;
    }
    return false;


  }

  hasTruckPreferredModule(){
    return (this.getUser().preferred_module ===  iolModules.trucks);
  }

}

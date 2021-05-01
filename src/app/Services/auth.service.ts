import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user = this.getUser();
  private dataSource = new BehaviorSubject(this.user);
  logged_in_user = this.dataSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(contact_number: string, password: string) {

    return this.http.post<any>('user/login/',
      {
        username: contact_number,
        password: password
      }).pipe(map(user => {
        if (!user['error']) {
          localStorage.setItem('user', JSON.stringify(user['data'][0]));
          this.dataSource.next(user['data'][0]);
        }
        else {
          console.error(user['message']);
        }
        return user;
      }
      ));
  }

  getToken() {
    var token = null;
    var user = JSON.parse(localStorage.getItem('user'));

    if (user != null)
      token = user['token'];

    return token;
  }

  unsetUser() {
    let val = localStorage.getItem('setvalue');
    if(val == 'true') {
      localStorage.removeItem('user');
    } else {
      localStorage.clear();
      this.dataSource.next({});
      this.router.navigate(['/'])
    }
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isAuthenticated() {
    if (localStorage.getItem('user') != 'undefined' && localStorage.getItem('user') != null) {
      return true;
    }
  }

  updatedDataSelection(data) {
    this.dataSource.next(data);
  }

  returnUser(){
    return this.logged_in_user;
  }

}

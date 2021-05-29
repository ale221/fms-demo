import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
  HttpResponse, HttpErrorResponse, HttpHeaders
} from '@angular/common/http';
import { tap } from "rxjs/operators";
import { environment } from '../../environments/environment';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService, private router: Router, private activatedRoute: ActivatedRoute) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth header from the service.

    const authHeader = this.auth.getToken();
    const url = environment.baseUrl;
    const sanpToRoadUrl = environment.sanpToRoadUrl;
    const signalR = environment.signalR;
    const translateUrl = environment.translateUrl;
    let useCaseId = "";
    this.activatedRoute.queryParams.subscribe(params => {
       useCaseId = params['usecase'];
       const localUser = JSON.parse(localStorage.getItem('user'));
       if (!useCaseId && localUser) {
        useCaseId = localUser['use_cases'].first_use_case_id;
       }
    });
    // Clone the request to add the new header.

    let cloneReq;
    if (authHeader != null) {
      // const company_id = this.auth.getUser()['company_id'];

      let headers = req.headers
        .set("Authorization", "Token " + authHeader)
        .set("use-case", useCaseId);

      if (req.url.includes(signalR) || req.url.includes(sanpToRoadUrl) || req.url.includes(translateUrl)) {
        cloneReq = req.clone({ url: req.url });
      } else {
        cloneReq = req.clone({ headers: headers, url: url + req.url });
      }
    }

    else {
      if (sanpToRoadUrl.includes(req.url)) {
        cloneReq = req.clone({ url: req.url });
      } else {
        cloneReq = req.clone({ url: url + req.url });
      }
    }
    // // console.log("auth new header",cloneReq)
    // Pass on the cloned request instead of the original request.
    return next.handle(cloneReq).pipe(
      tap((event => {
        if (event instanceof HttpResponse) {
        }
      }), err => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.auth.unsetUser();
          this.router.navigateByUrl('');
        }
      }));
  }

}

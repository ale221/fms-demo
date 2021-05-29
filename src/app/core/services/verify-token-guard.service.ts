import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";
import {ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {UserService} from "./user.service";
import {HttpController} from "./loading-controller";
import {ApiResponse} from "../model/api.response";
import {SwalService} from "./swal.service";
import { filter } from 'rxjs/operators';


@Injectable()
export class VerifyTokenGuardService {

  token;
  constructor(private route: Router,
              private swalService: SwalService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService,
              private userService: UserService) {}

  isValidToken;
  isValid() {
    this.activatedRoute.queryParams.pipe(
      filter(params => params.reset_password)
    )
      .subscribe(params => {
        this.token = params.reset_password;
      });
    let params = {};
    params['reset_token'] = this.token;
    this.userService.verifyToken(params)
      .subscribe(new class extends HttpController <ApiResponse<any[]>> {
          onComplete(): void {

          }

          onError(errorMessage: string, err: any): void {
            // do
            // console.log(errorMessage);
          }

          onNext(apiResponse: ApiResponse<any[]>): void {
            // console.log(apiResponse.status);
            if(apiResponse.status)
              this.context.isValidToken = true;
            else
              this.context.isValidToken = false;
          }

        }(this)
      );

    return this.isValidToken;

  }

}


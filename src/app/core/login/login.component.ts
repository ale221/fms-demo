import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponse, LoginApiResponse } from '../../core/model/api.response';
import { HttpController } from '../../core/services/loading-controller';
import { UserService } from '../../core/services/user.service';
import { SwalService } from '../../core/services/swal.service';
import { HttpStatusCodeEnum } from 'src/app/core/HttpStatusCodeEnum';
import { CustomValidators } from '../custom.validator';
import { User } from '../model/user';
import { UserRoleEnum } from 'src/app/platform/enum/user-role.enum';
import { EntityStatusEnum } from '../enum/entity-type.enum';
import { hypernymModules, iolModules } from '../model/module';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { isNullOrUndefined } from 'util';
import { AuthService } from '../services/auth.service';
import { BrandingService } from 'src/app/platform/shared/services/branding.service';

import { ConfirmedValidator } from 'src/app/core/model/ConfirmedValidator';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from 'src/app/platform/shared/services/menu.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  defaultLoader = {
    visibility: false
  }
  passwordRegEx = "^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,15}$";
  loginForm: FormGroup;
  errorMessage: string;
  forgetPassword = false;
  verifyForm: FormGroup;
  year = new Date().getFullYear();
  forgotPasswordForm: FormGroup;
  errorMessages: any;
  submitted = false;
  waitForPasswordCreation = false;
  createpassword = false;
  createPasswordForm: FormGroup;
  invalidEmail = false;
  currentEmailSave: any;
  show_password;
  @ViewChild('closeForgotPasswordForm') private closeForgotPasswordForm;
  loading = false;
  resetPasswordForm: FormGroup;
  firstTimeUser: boolean = false;

  showPassword = false;
  showConfirmPassword = false;
  showCurrentPassword = false;
  userData: any;
  newPasswordType = 'password'
  confirmPasswordType = 'password'
  confirmPasswordEye = false;
  newPasswordEye = false;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService, public router: Router,
    private brandingService: BrandingService,
    public menuService: MenuService,
    public translate: TranslateService,
    private userService: UserService,
    private swalService: SwalService) {
    this.forgotPasswordForm = this.formBuilder.group(
      {
        currentEmail: ['', [Validators.required, Validators.email]]
      }
    );
    this.verifyForm = this.formBuilder.group({
      otp: ['', [Validators.required]]
    });

    this.createPasswordForm = this.formBuilder.group({
      newpassword: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')])],
      confirmpassword: ['', [Validators.required]]
    }, {
      validator: ConfirmedValidator('newpassword', 'confirmpassword')
    });

    this.resetPasswordForm = this.formBuilder.group({
      oldPasswordReset: ['', Validators.compose([Validators.required])],
      newpasswordReset: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')])],
      confirmpasswordReset: ['', [Validators.required]]

    }, {
      validator: ConfirmedValidator('newpasswordReset', 'confirmpasswordReset')
    });

    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      }
      else if (event instanceof NavigationEnd) {
        this.loading = false;
      }
    });
  }

  ClickedOut(event) {
    // this.forgotPasswordForm.reset();
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
      // remover last bracket and attach commented code in
      // ,Validators.compose([
      //   Validators.required,
      //   Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')])]

    });
    // this.EmailControl.setValue(false)
    // debugger;
    if (this.EmailControl.invalid || this.EmailControl.invalid) {
      this.RememberControl.disable();
    } else {
      this.RememberControl.enable();
    }
    this.EmailControl.valueChanges.subscribe(x => {
      if (this.EmailControl.invalid) {
        this.RememberControl.disable();
      } else if (this.EmailControl.value && this.PasswordControl.value) {
        this.RememberControl.enable();
      }
    })

    this.PasswordControl.valueChanges.subscribe(x => {
      if (this.PasswordControl.invalid) {
        this.RememberControl.disable();
      } else if (this.EmailControl.value && this.PasswordControl.value) {
        this.RememberControl.enable();
      }
    })
    // this.RememberControl.valueChanges.subscribe(isMe => {
    //   console.log(isMe)
    //   if(isMe){
    //     localStorage.setItem('setvalue', "true");
    //   }  else {
    //     localStorage.setItem('setvalue', "false");
    //   }
    // })
    let val = localStorage.getItem('setvalue');
    if (val == 'true') {
      this.loginForm.patchValue({
        email: localStorage.getItem('useremail'),
        password: localStorage.getItem('userpassword'),
        remember: true,
      })
    }

  }

  get f() {
    return this.loginForm['controls'];
  }

  get EmailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get PasswordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get RememberControl(): FormControl {
    return this.loginForm.get('remember') as FormControl;
  }

  get formForNewPassword() {
    return this.createPasswordForm.controls;
  }

  onSubmitCreatePassword() {
    let params = {};
    params['email'] = this.currentEmailSave.email; //localStorage.getItem('emailForgetPassword');
    params['password'] = this.createPasswordForm.value.confirmpassword
    params['token'] = this.verifyForm.value.otp;
    // console.log("params======= ", params)

    this.userService.createNewPassword(params).subscribe((res: any) => {
      // console.log(res);
      try {
        if (res['error'] === true) {
          this.swalService.getErrorSwal(res.message); //"Please enter password again"
        }
        else {
          this.swalService.getSuccessSwal("Password changed successfully");
          this.forgetPassword = false;
          this.createpassword = false;
          this.firstTimeUser = false;
        }
      } catch (error) {

      }
    });



  }
  verify() { }
  onCloseMember() {
    this.forgotPasswordForm.reset();
  }

  onSubmitCode() {
    this.createPasswordForm.reset();
    this.waitForPasswordCreation = true;
    let params = {};
    params['token'] = this.verifyForm.value.otp;
    params['email'] = this.currentEmailSave.email;
    // console.log(this.verifyForm.value.otp);
    this.userService.verifyCode(params).subscribe(res => {
      // console.log(res);
      try {
        if (res['error'] === true) {
          // this.invalidEmail=true;
          this.swalService.getErrorSwal("Invalid Code please enter correct code");
          this.waitForPasswordCreation = false;
        } else {
          this.swalService.getSuccessSwal("Code is Successfully accepted");
          this.waitForPasswordCreation = false;
          this.forgetPassword = false;
          this.createpassword = true;
          this.firstTimeUser = false;
        }
        // this.waitForPasswordCreation=false;

        if (res['status'] === 200) {
          // this.waitForPasswordCreation=false;
          // this.createpassword =true;
        }

      } catch (error) {

      }
    });

  }

  forgotPassword() {
    let params = {};
    params['email'] = this.forgotPasswordForm.value.currentEmail;
    // console.log(params);
    this.userService.forgotPasword(params)
      .subscribe(new class extends HttpController<ApiResponse<any[]>> {
        onComplete(): void {

        }

        onError(errorMessage: string, err: any) {
          // do
          // console.log(errorMessage);

        }

        onNext(apiResponse: ApiResponse<any[]>): void {
          if (apiResponse.status) {
            this.context.swalService.getInfoSwal('Please check you email for further assistance');
          }
        }

      }(this)
      );
  }


  onSubmit(formValue: Object) {
    if (this.validate()) {
      this.login();
    }
  }

  validate(): boolean {
    this.errorMessage = null;
    if (this.loginForm.get('email').hasError('required')) {
      this.errorMessage = 'Email is required';
      return false;
    }
    if (this.loginForm.get('email').hasError('isEmail')) {
      this.errorMessage = 'Email is not valid';
      return false;
    }
    if (this.loginForm.get('password').hasError('required')) {
      this.errorMessage = 'Password is required';
      return false;
    }
    return true;
  }
  onSubmitForgotPassword() {
    // this.forgetPassword=true;
    this.sendEmailOnForgetPassword();
  }

  sendEmailOnForgetPassword() {
    this.defaultLoader = {
      visibility: true
    }

    let params = {};
    params['email'] = this.forgotPasswordForm.value.currentEmail; ///Save this email TO somewhere
    this.currentEmailSave = params;
    this.forgotPasswordForm.reset();
    this.userService.sendEmailForForgetPassword(params).subscribe(res => {
      // console.log(res['error']);
      try {
        if (res['error'] === true) {
          this.defaultLoader = {
            visibility: false
          }
          // this.invalidEmail=true;
          this.swalService.getErrorSwal("User doesn't exist");
        }
        else {
          this.defaultLoader = {
            visibility: false
          }
          this.verifyForm.reset();
          localStorage.setItem('emailForgetPassword', params['email']);
          this.swalService.getSuccessSwal("OTP sent successfully on the provided email");
          this.closeForgotPasswordForm.nativeElement.click();
          this.createpassword = false;
          this.forgetPassword = true;
          this.firstTimeUser = false;
        }

      } catch (error) {

      }
    });

  }
  sendEmailAgain() {
    this.swalService.getSuccessSwal("OTP sent successfully on the email");
    this.userService.sendEmailForForgetPassword(this.currentEmailSave).subscribe(res => {
      // console.log(res['error']);
      if (res['error'] === true) {
        // this.invalidEmail=true;
        this.swalService.getErrorSwal("Please send email again");
        this.createpassword = false;
        this.forgetPassword = false;
      } else {
        localStorage.setItem('emailForgetPassword', this.forgotPasswordForm.value.currentEmail);
      }
    });
  }
  backToLogin() {
    this.createpassword = false;
    this.forgetPassword = false;
    this.firstTimeUser = false;
  }
  onFilterChange(event) {
    // console.log(event,event.target.checked);
    if (event.target.checked === true) {
      localStorage.setItem('setvalue', "true");
      // localStorage.setItem('useremail',this.loginForm.value.email);
      // localStorage.setItem('userpassword',this.loginForm.value.password);
      // console.log(this.loginForm.value.email,this.loginForm.value.password);
    }
    else if (event.target.checked === false) {
      localStorage.setItem('setvalue', "false");
      // localStorage.setItem('useremail','');
      // localStorage.setItem('userpassword','');
      // console.log(this.loginForm.value.email,this.loginForm.value.password);
      // console.log(localStorage.getItem('setvalue'),"login");
    }

  }

  login(): void {
    let value = this.RememberControl.value;
    if (value) {
      localStorage.setItem('useremail', this.EmailControl.value);
      localStorage.setItem('userpassword', this.PasswordControl.value);
    } else if (!value) {
      localStorage.setItem('useremail', '');
      localStorage.setItem('userpassword', '');
    }
    this.loginForm.value['email'] = this.loginForm.value['email'].toLowerCase();
    this.userService.login(this.loginForm.value as User).subscribe(new class extends HttpController<LoginApiResponse<User>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
        this.context.errorMessage = errorMessage;
      }

      onNext(apiResponse: LoginApiResponse<User>): void {
        if (apiResponse.status) {
          if (apiResponse.status === 200) {
            this.context.submitted = true;
            apiResponse['data'].avatar = apiResponse['data'].photo;
            this.context.userData = apiResponse['data'] as User;
            this.context.authService.setUser(apiResponse['data'] as User);
            const user = this.context.authService.getUser() as User;
            // this.context.translate.use(user['language'].name === 'English' ? 'en' : 'ar');
            this.context.theme = this.context.brandingService.inititalizeBranding();
            this.context.menu = this.context.menuService.inititalizeMenu();
            // if (user.user_role_id === UserRoleEnum.User || user.status === EntityStatusEnum.Inactive) {
            //   this.context.router.navigate(['unauthorized']);
            // } else {

            if (apiResponse['data'].is_first_time_login) {
              this.context.authService.unsetUser();//remove user from localstorage
              this.context.firstTimeUser = true;
              this.context.createpassword = false;
              this.context.forgetPassword = false;
            } else {
              this.context.firstTimeUser = false;
              this.context.redirect(apiResponse['data'].preferred_module, user);
            }

            // }
          } else if (apiResponse.status === 500) {
            this.context.submitted = false;
            this.context.errorMessage = apiResponse.message;
            localStorage.setItem('useremail', '');
            localStorage.setItem('userpassword', '');
            this.context.authService.unsetUser();
          }
        }
      }
    }(this)
    );
  }

  redirect(module_id: number = 1, user: User) {
    const isClient = user.user_role_id === UserRoleEnum.CustomerClient;
    const isWorkshopTechnician = user.user_role_id === UserRoleEnum.WorkshopTechnician;
    const module = hypernymModules[module_id];

    let allowedRoute = '';

    if (user['menuaccess'] && user['menuaccess'].length > 0) {
      allowedRoute = (user['menuaccess'][0]['child'] && user['menuaccess'][0]['child'].length > 0) ? user['menuaccess'][0]['child'][0].route : '';
    }

    this.router.navigate(['/' + module + '/' + allowedRoute], { queryParams: { usecase: user['use_cases'].first_use_case_id } });

    // if (isClient) {
    //   this.router.navigate(['/iol/client/', user['associated_client']]);
    // }
    // if (isWorkshopTechnician) {
    //   this.router.navigate(['/iol/maintenances/']);
    // } else if (module_id < 2) {
    //   let module = hypernymModules[module_id];
    //   if (isNullOrUndefined(module)) {
    //     module = '';
    //   }
    //   this.router.navigate(['/iol/' + module]);
    // } else {
    //   this.router.navigate(['/' + module], { queryParams: {usecase: 1}});
    // }
  }

  togglePassword(value) {
    this.show_password = value.password;
  }
  togglePassword1() {
    this.show_password = false;
  }

  get resetPasswordControls() {
    return this.resetPasswordForm.controls;
  }

  validatePasswordForm(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.resetPasswordForm.hasError('mismatch')) {
      this.errorMessages.push('Mismatch Password');
      isValid = false;
    }
    if (this.resetPasswordForm.hasError('same')) {
      this.errorMessages.push('Password cannot be same');
      isValid = false;
    }
    return isValid;
  }

  onSubmitResetPassword(formValues) {
    if (this.validatePasswordForm()) {
      const params = {};
      params['new_password'] = formValues.newpasswordReset;
      params['old_password'] = formValues.oldPasswordReset;
      params['is_first_time_login'] = false;
      this.authService.setUser(this.userData);
      this.userService.resetPassword(params).subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {

        }

        onError(errorMessage: string, err: any) {
          console.log(errorMessage);
          this.context.authService.unsetUser();
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.skipForNow();
          } else if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
            this.context.authService.unsetUser();
          }
        }
      }(this)
      );
    }
  }

  skipForNow() {
    this.authService.setUser(this.userData)
    const user = this.authService.getUser() as User;
    this.redirect(user.preferred_module, user);
  }

  toggleNewPasswordType() {
    if (this.newPasswordType === 'password') {
      this.newPasswordEye = true;
      this.newPasswordType = 'text';
    } else if (this.newPasswordType === 'text') {
      this.newPasswordEye = false;
      this.newPasswordType = 'password';
    }
  }

  toggleConfirmPasswordType() {
    if (this.confirmPasswordType === 'password') {
      this.confirmPasswordEye = true;
      this.confirmPasswordType = 'text';
    } else if (this.confirmPasswordType === 'text') {
      this.confirmPasswordEye = false;
      this.confirmPasswordType = 'password';
    }
  }

}

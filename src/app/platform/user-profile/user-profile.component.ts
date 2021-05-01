import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CustomValidators } from '../../core/custom.validator';
import { FormBuilder, FormGroup, Validators,FormControl } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ApiResponse, LoginApiResponse } from '../../core/model/api.response';
import { HttpController } from '../../core/services/loading-controller';
import { DropDownItem } from '../data/model/dropdown-item';
import { FormService } from '../services/FormService';
import { hypernymModules, iolModules } from '../../core/model/module';
import { AppLoader } from '../data/model/app-loader';
import { SwalService } from '../../core/services/swal.service';
import { isNullOrUndefined } from 'util';
import { DataTransferService } from '../../core/services/data-transfer.service';
import { UserRoleEnum } from '../enum/user-role.enum';
import { HttpStatusCodeEnum } from '../../core/HttpStatusCodeEnum';
import { ErrorMessage } from '../error-message';
// import {ConfirmDialogModule, ConfirmationService} from 'primeng/primeng';
import { Router } from '@angular/router';
import { PrimengDropdownItem } from '../data/model/primng-dropdown-item';
import { CanDeactivateComponent } from '../shared/can-deactivate.service';
import { Observable, Subscription } from 'rxjs';
import { BrandingService } from '../shared/services/branding.service';
import { PackageType } from 'src/app/core/enum/packages-enum';
import { GetUserService } from 'src/app/Services/get-profile.service';
import { StorageService } from 'src/app/Services/local-storage.service';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

export class UserProfileComponent implements OnInit, CanDeactivateComponent {
  deactivate = false;
  nextUrl: string;
  user: any;
  profileForm: FormGroup;
  form: FormGroup;
  itemListModule = [];
  date_of_joining: Date;
  selectedModule;
  password = null;
  oldPassword = null;
  HTTPStatusCodeEnum = HttpStatusCodeEnum;
  packageName = '';

  @ViewChild('myInput')
  myInputVariable: any;
  @ViewChild('img')
  image: any;
  showAlert = true;
  profileSubmitted: boolean = false;

  @ViewChild('closeForm') private closeForm;
  theme;
  isAuthorized = false;
  loggedInUser;
  apiCall = 0;

  subscription$ = new Subscription;
  userSubscription$ = new Subscription;
  sidebarCheck;

  constructor(private authService: AuthService,
    private swalService: SwalService,
    private formService: FormService,
    private dataTransferService: DataTransferService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private brandingService: BrandingService,
    // private confirmationService: ConfirmationService,
    private getUserService: GetUserService,
    private storageService: StorageService,
    private drawerService:DrawerService,
    private route: Router) {

    this.theme = this.brandingService.styleObject();

    this.form = this.formBuilder.group({
      password: ['',
        Validators.compose([
          Validators.required,
          Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,15}$')
        ])],
      confirmPassword: ['', Validators.required],
      oldPassword: ['', Validators.required]
    },
      {
        validator: [CustomValidators.samePasswords, CustomValidators.passwordMatcher] // your validation method,
      });

    this.profileForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      first_name: [null, [CustomValidators.isAlphabetsAndSpace, Validators.required]],
      last_name: [null, [CustomValidators.isAlphabetsAndSpace, Validators.required]],
      email: [],
      role: [],
      contact_number: ['', [Validators.required]], //CustomValidators.isAlphabetsAndNumbers
      date_joined: [],
      preferred_module: [{ value: '', disabled: true }],
      customer: [],
    });
  }

  isAuthorizedUser(value) {
    this.isAuthorized = value;
    if (this.loggedInUser.package[0].package_id === PackageType.png) {
      this.isAuthorized = false;
    }
  }

  ngOnInit() {
    this.loggedInUser = this.authService.getUser();

    this.drawerService.getValue().subscribe(res=>{
        this.sidebarCheck=res;
      console.log("ressssssssssssss1",res);
      console.log("ressssssssssssss2",this.sidebarCheck);
    })

    this.getDropDowns();
    this.getUser();   // get user profile
    // watch for changes in localStorage, change header properties accordingly for user
    this.userSubscription$ = this.storageService.changes.subscribe(res => {
      // if (this.apiCall === 0) {
      //   this.getUser();
      //   this.apiCall = 1;
      // }
      setTimeout(() => {
        this.getUser();
      }, 1000);
      if(this.userSubscription$) {
        this.userSubscription$.unsubscribe();
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    console.log("iswhtspace",isWhitespace);

  }

  // Profile Section
  getDropDowns() {
    this.itemListModule = [
      { label: 'IoL (Bins)', value: iolModules.bins },
      { label: 'IoL (trucks)', value: iolModules.trucks },
      { label: 'IoA', value: hypernymModules.ioa },
      { label: 'IoL', value: hypernymModules.iol },
      { label: 'FFP', value: hypernymModules.ffp }
    ];
  }

  isAdmin;
  isSupervisor = false;
  restrictedForm = false;
  public avatar: File = null;
  public avatar_url: string = null;
  appLoader = new AppLoader();
  getUser() {
    this.user = this.authService.getUser();
    if (this.user.package && this.user.package.length > 0) {
      this.packageName = this.user.package[0].package_id__name;
    }
    this.isAdmin = (this.user.user_role_id === UserRoleEnum.Admin);
    const is_customer_client = this.user.user_role_id === UserRoleEnum.CustomerClient;
    if (is_customer_client) {
      this.restrictedForm = true;
    }

    this.userService.getUserData().subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
      onComplete(): void {
      }

      onError(errorMessage: string, err: any) {
        console.log(errorMessage);
      }

      onNext(data: any): void {
        if (data.status === 200) {
          this.context.user = data.data;
          this.context.setForm();
        } else if (data.status === 500) {
          this.context.swalService.getErrorSwal(data.message);
        }
      }
    }(this)
    );

  }

  setForm() {
    this.avatar_url = isNullOrUndefined(this.user.user_image) ? null : this.user.user_image;
    this.date_of_joining = (new Date(this.user.date_joined));

    this.profileForm.patchValue({
      id: this.user.id,
      first_name: this.user.first_name ? this.user.first_name : null,
      last_name: this.user.last_name ? this.user.last_name : null,
      email: this.user.email ? this.user.email : null,
      role: this.user.user_group_name ? this.user.user_group_name : 'Super Admin',
      contact_number: this.user.contact_number,//this.user.contact_number == null ? '' : this.user.contact_number,
      preferred_module: this.user.preferred_module ? this.user.preferred_module : null,
      customer: this.user.customer?.name ? this.user.customer?.name : null
    });

    console.log(this.profileForm)

    console.log("this.avatar_url==", this.avatar_url)
  }

  notImage = false;
  fileChange(event) {
    console.log('file change', event);
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const img = document.querySelector('#preview img') as HTMLImageElement;
      if (fileList[0].type.indexOf('image') === -1) {
        this.myInputVariable.nativeElement.value = '';
        this.notImage = true;
        this.showAlert = true;
      } else if (file.size > 1000000) { // 1MB
        this.myInputVariable.nativeElement.value = '';
        alert('File is too big! Image must be less than 1 MB');
        this.avatar = null;
      } else {
        this.profileForm.markAsDirty();
        this.notImage = false;
        this.avatar = file;
        this.avatar_url = ' ';
        const reader = new FileReader();
        reader.onload = (function (aImg) {
          return function (e) {
            aImg.src = e.target.result;
          };
        })(img);
        reader.readAsDataURL(file);
      }
    }
  }

  errorMessages1 = [];
  validate() {
    let isValid = true;
    this.errorMessages1 = [];
    if (this.profileForm.get('first_name').hasError('required')) {
      this.errorMessages1.push('First Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.profileForm.get('first_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages1.push('First Name should be alphabets');
      isValid = false;
    }
    if (this.profileForm.get('last_name').hasError('required')) {
      this.errorMessages1.push('Last Name ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    if (this.profileForm.get('last_name').hasError('isAlphabetsAndSpace')) {
      this.errorMessages1.push('Last Name should be alphabets');
      isValid = false;
    }
    if (this.profileForm.get('contact_number').hasError('required')) {
      this.errorMessages1.push('Contact Number ' + ErrorMessage.REQUIRED);
      isValid = false;
    }
    return isValid;
  }


  onSubmit(formValue) {
    this.profileSubmitted = true;
    // console.log('formValue', formValue);
    // console.log("this.avatar= ", this.avatar)
    // console.log("this.avatar_url= ", this.avatar_url)
    const paramUser: FormData = new FormData();
    paramUser['first_name'] = formValue.first_name;
    paramUser['last_name'] = formValue.last_name;
    paramUser['contact_number'] = formValue.contact_number.toString();
    console.log("numbers",paramUser['contact_number']);
    paramUser['id'] = this.user.id;

    if (this.validate()) {
      if (!isNullOrUndefined(this.avatar)) {
        paramUser['user_image'] = this.avatar;
      }
      else if (!isNullOrUndefined(this.avatar_url)) {
        // let image = this.user['user_image'].split('/');
        // image = image[image.length - 1];
        // paramUser['user_image'] = image;
      }
      else {
        paramUser['user_image'] = 'remove';
      }
      // console.log("paramUser before api call= ", paramUser)
      this.userService.modifyUserData2(paramUser)
        .subscribe(apiResponse => {
          if (apiResponse['status'] === 200) {
            this.profileForm.markAsPristine();
            this.swalService.getSuccessSwal('User has been edited successfully');

            const u = this.authService.getUser();
            u['avatar'] = apiResponse['data']['user_image'];
            u['first_name'] = apiResponse['data']['first_name'];
            u['last_name'] = apiResponse['data']['last_name'];
            u['contact_number'] = apiResponse['data']['contact_number'];

            this.authService.setUser(u);
            localStorage.setItem('user', JSON.stringify(u));

            this.getUserService.setValue(u);

            this.getUser();
            this.deactivate = true;
            this.submitted = true;
            this.profileSubmitted = true;
          } else if (apiResponse['status'] === 500) {
            this.swalService.getErrorSwal('Profile not Updated', apiResponse['message']);
          }
        })
    }
  }
  // Profile Section End

  // Forgot Password
  showPassword = false;
  showConfirmPassword = false;
  showCurrentPassword = false;
  errorMessages = [];
  validatePasswordForm(): boolean {
    let isValid = true;
    this.errorMessages = [];
    if (this.form.hasError('mismatch')) {
      this.errorMessages.push('Mismatch Password');
      isValid = false;
    }
    if (this.form.hasError('same')) {
      this.errorMessages.push('Password cannot be same');
      isValid = false;
    }

    return isValid;
  }

  onSubmitPassword() {
    if (this.validatePasswordForm()) {
      this.password = this.form.value.password;
      this.oldPassword = this.form.value.oldPassword;
      const params = {};
      params['new_password'] = this.password;
      params['old_password'] = this.oldPassword;
      params['is_first_time_login'] = false;
      this.userService.resetPassword(params).subscribe(new class extends HttpController<LoginApiResponse<any[]>> {
        onComplete(): void {

        }

        onError(errorMessage: string, err: any) {
          console.log(errorMessage);
        }

        onNext(apiResponse: LoginApiResponse<any[]>): void {
          console.log(apiResponse);
          if (apiResponse.status === HttpStatusCodeEnum.Success) {
            this.context.closeForm.nativeElement.click();
            this.context.swalService.getSuccessSwal('Password has been reset');
          } else if (apiResponse.status === HttpStatusCodeEnum.Error) {
            this.context.swalService.getErrorSwal(apiResponse.message);
          }
        }
      }(this)
      );
    }
  }

  resetPasswordForm() {
    this.form.reset();
  }

  //  Forgot Password End
  submitted = false;
  removeImage() {
    if (this.myInputVariable) {
      this.myInputVariable.nativeElement.value = '';
    }
    this.avatar_url = null;
    this.profileForm.markAsDirty();
    this.avatar = null;
    this.notImage = false;
    this.image.nativeElement.src = '/assets/images/iol/driver_placeholder.png';
  }

  // Show Dialog Box on navigation on other page without saving changes
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.deactivate && this.profileForm.dirty && this.submitted) {
      this.deactivate = false;
      this.submitted = false;
    }
    if (this.deactivate) {
      return true;
    }
    //  else if (this.profileForm.touched && this.profileForm.dirty) {
    //   this.confirmationService.confirm({
    //     message: 'Are you sure that you want to discard UNSAVED changes?',
    //     header: 'Confirmation',
    //     accept: () => {
    //       this.deactivate = true;
    //       this.route.navigateByUrl(this.route.parseUrl(this.nextUrl));
    //     },
    //     reject: () => {
    //       this.deactivate = false;
    //     }
    //   });
    //   return this.deactivate;
    // }
    return true;
  }

  ngOnDestroy(): void {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
    if (this.userSubscription$) {
      this.userSubscription$.unsubscribe()
    }
  }

}

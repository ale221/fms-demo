import { Component ,HostListener,OnDestroy} from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, RouterEvent, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

import { AuthService } from 'src/app/Services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'hypernet-platform';
  loading;

  // @HostListener("window:onbeforeunload",["$event"])
  // clearLocalStorage(event){
  //   let val=localStorage.getItem('setvalue');
  //   if(val != "true")
  //   {
  //      this.authService.unsetUser();
  //   }

  // }

  constructor(private authService: AuthService, private router: Router) {
    this.loading = true;
    let val=localStorage.getItem('setvalue');
    // if(val != "true")
    // {
    //    this.authService.unsetUser();
    //    this.router.navigate(['/']);
    // }
  }

  ngAfterViewInit() {
    this.router.events
      .subscribe((event) => {
        if(event instanceof NavigationStart) {
          // this.loading = true;
        }
        else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
        ) {
          this.loading = false;
        }
      });
  }

  @HostListener('window:onbeforeunload')
   ngOnDestroy()
  {

    let val=localStorage.getItem('setvalue');
    if(val != "true")
    {
      this.authService.unsetUser();
    }

  }
  // @HostListener('window:onbeforeunload')
  // doUnload(): void {

  //   let val=localStorage.getItem('setvalue');
  //   if(val != "true")
  //   {
  //      this.authService.unsetUser();
  //   }

  // }

}

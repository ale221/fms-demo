import {Injectable} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GetUsecaseService {

  constructor(private activatedRoute: ActivatedRoute) {
  }
  useCaseId = 0;
  public getUsecaseId() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.useCaseId = params['usecase'];
      const user = JSON.parse(localStorage.getItem('user'));
      if (!this.useCaseId) {
        this.useCaseId = user.use_cases.first_use_case_id;
      }
    });
    return Number(this.useCaseId);
  }


}

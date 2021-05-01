import {Injectable} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {

  constructor() { }

  private valueObs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public setValue(value: any): void {
    this.valueObs.next(value);
  }

  public getValue(): Observable < any > {
    console.log("ingetvalueeeeeeee",this.valueObs);
      return this.valueObs;
  }

}
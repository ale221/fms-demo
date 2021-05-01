import {Injectable} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltersService {

  constructor() { }

  private valueObs: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private playback: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private playbackPoly: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public setValue(value: any): void {
    this.valueObs.next(value);
  }

  public getValue(): Observable < any > {
      return this.valueObs;
  }

  public setPlaybackValue(value: any): void {
    this.playback.next(value);
  }

  public getPlaybackValue(): Observable < any > {
      return this.playback;
  }
  public setPlaybackPolyValue(value: any): void {
    this.playbackPoly.next(value);
  }

  public getPlaybackPolyValue(): Observable<any> {
    return this.playbackPoly;
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TranslateDetector {
  menuData: Subject<string> = new Subject();

  constructor(private http: HttpClient) {
  }

  private getTranslatedMenu(): Observable<any> {
    // TODO: Dummy API need to Change when Asad is done with this...
    const url = `/iof/shifts/`;
    return this.http.get(url);
  }

  init() {
    this.getTranslatedMenu().subscribe(data => {
        this.menuData.next(data);
    });
  }
}

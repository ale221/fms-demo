import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SearchItem, SearchResponse} from '../../model/searchResponse';
import {AppConfig} from '../../app.config';
import {LoginApiResponse} from '../../core/model/api.response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  apiRoot: string = 'https://itunes.apple.com/search';
  constructor(private http: HttpClient) {}

  // search(term: string): Observable<SearchItem[]> {
  //   let apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;
  //   return this.http.get(apiURL).pipe(
  //     map(res => {
  //       return res.results.map(item => {
  //         return new SearchItem(
  //           item.trackName,
  //           item.artistName,
  //           item.trackViewUrl,
  //           item.artworkUrl30,
  //           item.artistId
  //         );
  //       });
  //     })
  //   );
  // }

  getSearch(key, params: any) :  Observable<LoginApiResponse<SearchResponse[]>> {
    // console.log(params);
    const url = `${AppConfig.APIOptionsHandler(key)}`;
    return this.http.get<LoginApiResponse<SearchResponse[]>>(url, {params: params});
  }






}

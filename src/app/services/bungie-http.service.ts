import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServerResponse } from 'bungie-api-ts/destiny2';

@Injectable()
export class BungieHttpService {
  private _origin: string;
  private _apiKey: string;
  public error: BehaviorSubject<ServerResponse<any>>;

  constructor(private http: HttpClient) {
    this.error = new BehaviorSubject(null);
    this._origin = window.location.protocol + '//' + window.location.hostname;
    switch (this._origin) {
      case 'http://dev.guardian.theater':
        this._apiKey = '4da0bc9d76774c5696ea2703b129a2cd';
        break;

      case 'https://beta.guardian.theater':
        this._apiKey = '97c176d9f0f144f0b70bb69a455234a6';
        break;

      case 'https://guardian.theater':
        this._apiKey = 'fc91f657672b41189d2682be8eb51697';
        break;
    }
  }

  get(url): Observable<ServerResponse<any>> {
    let headers = new Headers();
    return <Observable<ServerResponse<any>>>this.http.get(url, {
      headers: new HttpHeaders().set('x-api-key', this._apiKey)
    });
  }
}

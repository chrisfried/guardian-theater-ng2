import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class BungieHttpService {
  private _origin: string;
  private _apiKey: string;

  constructor(
    private http: Http
  ) {
    this._origin = window.location.protocol + '//' + window.location.hostname;
    switch (this._origin) {
      case 'http://dev.guardian.theater':
        this._apiKey = '4da0bc9d76774c5696ea2703b129a2cd';
        break;

      case 'https://beta.guardian.theater':
        this._apiKey = '97c176d9f0f144f0b70bb69a455234a6';
        break;

      case 'https://manual.guardian.theater':
        this._apiKey = 'db0566f9a1ff4223863f38608b49f364';
        break;

      case 'https://guardian.theater':
        this._apiKey = 'fc91f657672b41189d2682be8eb51697';
        break;
    }
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('x-api-key', this._apiKey);
  }

  get(url) {
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }
}

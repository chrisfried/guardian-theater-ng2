import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';

@Injectable()
export class BungieHttpService {

  constructor(private http: Http) {}

  createAuthorizationHeader(headers: Headers) {
    headers.append('x-api-key', '4da0bc9d76774c5696ea2703b129a2cd');
  }

  get(url) {
    let headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }
}

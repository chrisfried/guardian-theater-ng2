import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  throwError as observableThrowError
} from 'rxjs';
import { ServerResponse } from 'bungie-api-ts/destiny2';
import { map, tap, switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { AuthService } from './auth.service';

@Injectable()
export class BungieHttpService {
  public error: BehaviorSubject<ServerResponse<any>>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.error = new BehaviorSubject(null);

    let initHeaders = new HttpHeaders();
    initHeaders = initHeaders.set('X-API-Key', environment.bungie.apiKey);
  }

  get(url: string) {
    return this.authService.getKey().pipe(map(key => {
      try {
        if (key == null) {
          let headers = new HttpHeaders();
          headers = headers.set('X-API-Key', environment.bungie.apiKey);
          return {
            headers: headers
          };
        } else {
          let headers = new HttpHeaders();
          headers = headers
            .set('X-API-Key', environment.bungie.apiKey)
            .set('Authorization', 'Bearer ' + key);
          return {
            headers: headers
          };
        }
      } catch (err) {
        console.dir(err);
        let headers = new HttpHeaders();
        headers = headers.set('X-API-Key', environment.bungie.apiKey);
        return {
          headers: headers
        };
      }
    }),
    switchMap (options => {
      return this.http.get(url, options).pipe(
        tap(
          (res: ServerResponse<any>) => {
            if (
              res &&
              res.Response &&
              res.Response.ErrorCode &&
              res.Response.ErrorCode !== 1
            ) {
              this.error.next(res);
            }
          },
          err => observableThrowError(err || 'Bungie Server error')
        )
      );
    }))
  }
}

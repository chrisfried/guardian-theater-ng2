import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from '../services/bungie-http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class GuardianService {
  private _searchResults: Observable<bungie.SearchDestinyPlayer>;
  private _accountResults: Observable<bungie.Account>;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this._searchResults = this.route.params
      .map((params: Params) => {
        let platform = -1;
        let guardian = '';
        if (params['platform']) {
          platform = params['platform'];
        }
        if (params['guardian']) {
          guardian = params['guardian'];
        }
        return { platform, guardian };
      })
      .map(({ platform, guardian }) => {
        if (guardian.length) {
          return 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + guardian + '/';
        } else {
          return '';
        }
      })
      .switchMap((url) => {
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._accountResults = this._searchResults
      .map(results => {
        try {
          if (results.Response.length === 1) {
            let membershipType = results.Response[0].membershipType;
            let membershipId = results.Response[0].membershipId;
            return 'https://www.bungie.net/Platform/Destiny/' + membershipType + '/Account/' + membershipId + '/Summary/';
          } else {
            return '';
          }
        } catch (e) {
          return '';
        }
      })
      .switchMap((url) => {
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));
  }

  get searchResults(): Observable<bungie.SearchDestinyPlayer> {
    return this._searchResults;
  }

  get accountResults(): Observable<bungie.Account> {
    return this._accountResults;
  }

}

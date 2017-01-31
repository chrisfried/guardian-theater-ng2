import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from '../services/bungie-http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class GuardianService {
  private _searchResults: Observable<bungie.SearchDestinyPlayerResponse>;
  private _accountResults: Observable<bungie.AccountResponse>;
  private _activitiesResults: Observable<bungie.ActivityHistoryResponse>;

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

    this._activitiesResults = Observable.combineLatest(
      this.route.params,
      this._accountResults
    ).map(combined => {
      try {
        let activeCharacter = combined[1].Response.data.characters[0];
        if (combined[0]['character']) {
          let characterId = combined[0]['character'];
          activeCharacter = combined[1].Response.data.characters.find(function (character) {
            return character.characterBase.characterId === characterId;
          });
        }
        let mode = 'None';
        if (combined[0]['gamemode']) {
          mode = combined[0]['gamemode'];
        }
        let page = '0';
        if (combined[0]['page']) {
          page = combined[0]['page'];
        }
        let membershipType = activeCharacter.characterBase.membershipType;
        let membershipId = activeCharacter.characterBase.membershipId;
        let characterId = activeCharacter.characterBase.characterId;
        return 'https://www.bungie.net/Platform/Destiny/Stats/ActivityHistory/'
          + membershipType + '/' + membershipId + '/' + characterId + '/?mode=' + mode + '&count=10&page=' + page;
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

  get searchResults(): Observable<bungie.SearchDestinyPlayerResponse> {
    return this._searchResults;
  }

  get accountResults(): Observable<bungie.AccountResponse> {
    return this._accountResults;
  }

  get activitiesResults(): Observable<bungie.ActivityHistoryResponse> {
    return this._activitiesResults;
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from '../services/bungie-http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class GuardianService {
  private _searchString: Observable<string>;
  private _platform: Observable<string>;
  private _queryUrl: Observable<string>;
  private _searchResults: Observable<{ Response?}>;

  private _membershipType: Observable<number>;
  private _membershipId: Observable<string>;
  private _displayName: Observable<string>;
  private _accountUrl: Observable<string>;
  private _accountResults: Observable<{
    Response: {
      data: {
        characters: {}[]
      }
    }
  }>;
  private _characters: Observable<{
    characterBase: {
      characterId: string;
    }
  }[]>;
  private _characterId: Observable<string>;
  private _activeCharacter: Observable<{
    characterBase: {
      characterId: string;
      membershipType: number;
    }
  }>;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this._platform = this.route.params
      .map((params: Params) => {
        if (params['platform']) {
          return params['platform'];
        } else {
          return '-1';
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._searchString = this.route.params
      .map((params: Params) => {
        if (params['guardian']) {
          return params['guardian'];
        } else {
          return '';
        };
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._queryUrl = Observable.combineLatest(
      this._searchString,
      this._platform
    ).map(combined => {
      if (combined[0].length) {
        return 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/' + combined[1].toString() + '/' + combined[0].toString() + '/';
      } else {
        return '';
      }
    })
    .distinctUntilChanged()
    .do((x) => console.log(x));

    this._searchResults = this._queryUrl
      .flatMap((url, i) => {
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

    this._membershipType = this._searchResults
      .map(res => {
        try {
          if (res.Response.length === 1) {
            return res.Response[0].membershipType;
          } else {
            return -1;
          }
        } catch (e) {
          return -1;
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._membershipId = this._searchResults
      .map(res => {
        try {
          if (res.Response.length === 1) {
            return res.Response[0].membershipId;
          } else {
            return '';
          }
        } catch (e) {
          return '';
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._displayName = this._searchResults
      .map(res => {
        try {
          if (res.Response.length === 1) {
            return res.Response[0].displayName;
          } else {
            return '';
          }
        } catch (e) {
          return '';
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));


    this._accountUrl = Observable.combineLatest(
      this._membershipType,
      this._membershipId
    ).map(combined => {
      if (combined[0] > 0 && combined[1].length) {
        return 'https://www.bungie.net/Platform/Destiny/' + combined[0].toString() + '/Account/' + combined[1].toString() + '/Summary/';
      } else {
        return '';
      }
    })
    .distinctUntilChanged()
    .do((x) => console.log(x));

    this._accountResults = this._accountUrl
      .flatMap((url, i) => {
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


    this._characters = this._accountResults
      .map(results => {
        if (results) {
          try {
            return results.Response.data.characters;
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      })
      .distinctUntilChanged()
      .do((x) => console.log(x));

    this._characterId = Observable.combineLatest(
      this.route.params,
      this._characters
    ).map(combined => {
      if (combined[0]['character']) {
        return combined[0]['character'];
      } else if (combined[1].length) {
        try {
          return combined[1][0].characterBase.characterId;
        } catch (e) {
          return '';
        }
      } else {
        return '';
      }
    })
    .distinctUntilChanged()
    .do((x) => console.log(x));

    this._activeCharacter = Observable.combineLatest(
      this._characters,
      this._characterId
    ).map(combined => {
      return combined[0].find(function (character) {
        return character.characterBase.characterId === combined[1];
      });
    })
    .distinctUntilChanged()
    .do((x) => console.log(x));
  }

  get searchResults(): Observable<{ Response?}> {
    return this._searchResults;
  }

  get characters(): Observable<{}[]> {
    return this._characters;
  }

  get activeCharacter() {
    return this._activeCharacter;
  }

}

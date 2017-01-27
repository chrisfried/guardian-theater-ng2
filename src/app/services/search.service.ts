import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from './bungie-http.service';

@Injectable()
export class SearchService {
  private _searchString: BehaviorSubject<string>;
  private _platform: BehaviorSubject<string>;
  private _queryUrl: Observable<string>;
  private _searchResults: Observable<{ Response?}>;

  constructor(private bHttp: BungieHttpService) {
    this._searchString = new BehaviorSubject('');
    this._platform = new BehaviorSubject('-1');

    this._queryUrl = Observable.combineLatest(
      this.searchString,
      this.platform
    ).map(combined => {
      if (combined[0].length) {
        return 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/' + combined[1].toString() + '/' + combined[0].toString() + '/';
      } else {
        return '';
      }
    });

    this._searchResults = this.queryUrl
      .flatMap((url, i) => {
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      });
  }

  set setSearchString(string: string) {
    this._searchString.next(string);
  }

  set setPlatform(platform: string) {
    this._platform.next(platform);
  }

  get searchString() {
    return this._searchString.asObservable();
  }

  get platform() {
    return this._platform.asObservable();
  }

  get queryUrl() {
    return this._queryUrl;
  }

  get searchResults(): Observable<{ Response?}> {
    return this._searchResults;
  }

}

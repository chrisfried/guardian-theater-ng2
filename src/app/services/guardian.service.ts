import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from './bungie-http.service';

@Injectable()
export class GuardianService {
  private _membershipType: BehaviorSubject<number>;
  private _membershipId: BehaviorSubject<string>;
  private _displayName: BehaviorSubject<string>;
  private _characterId: BehaviorSubject<string>;
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
      characterId
    }
  }[]>;
  private _activeCharacter: Observable<{
    characterBase: {
      characterId
    }
  }>;

  constructor(private bHttp: BungieHttpService) {
    this._membershipType = new BehaviorSubject(-1);
    this._membershipId = new BehaviorSubject('');
    this._displayName = new BehaviorSubject('');
    this._characterId = new BehaviorSubject('');

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
      .debounceTime(250)
      .distinctUntilChanged();

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
      .distinctUntilChanged();

    this._characters = this._accountResults
      .map(results => {
        if (results) {
          try {
            return results.Response.data.characters;
          } catch (e) {
            console.log(e);
            return Observable.empty();
          }
        } else {
          return Observable.empty();
        }
      })
      .distinctUntilChanged();

    this._activeCharacter = Observable.combineLatest(
      this._characters,
      this._characterId
    ).map(combined => {
      return combined[0].find(function (character) {
        return character.characterBase.characterId === combined[1];
      });
    })
      .debounceTime(250)
      .distinctUntilChanged();
  }

  set setMembershipType(type: number) {
    this._membershipType.next(type);
  }

  set setMembershipId(id: string) {
    this._membershipId.next(id);
  }

  set setDisplayName(name: string) {
    this._displayName.next(name);
  }

  set setCharacterId(id: string) {
    this._characterId.next(id);
  }

  get account() {
    return this._accountResults;
  }

  get characters() {
    return this._characters;
  }

  get characterId() {
    return this._characterId;
  }

  get activeCharacter() {
    return this._activeCharacter;
  }

}

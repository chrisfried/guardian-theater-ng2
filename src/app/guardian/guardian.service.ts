import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from '../services/bungie-http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class GuardianService {
  private _membershipId: BehaviorSubject<string>;
  private _activityMode: BehaviorSubject<string>;
  private _activityPage: BehaviorSubject<number>;

  public searchName: BehaviorSubject<string>;
  public membershipType: BehaviorSubject<number>;
  public displayName: BehaviorSubject<string>;
  public characters: BehaviorSubject<bungie.Character[]>;
  public characterId: BehaviorSubject<string>;
  public activeCharacter: BehaviorSubject<bungie.Character>;
  public activities: BehaviorSubject<bungie.Activity[]>;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this._membershipId = new BehaviorSubject('');
    this._activityMode = new BehaviorSubject('None');
    this._activityPage = new BehaviorSubject(0);

    this.searchName = new BehaviorSubject('');
    this.membershipType = new BehaviorSubject(-1);
    this.displayName = new BehaviorSubject('');
    this.characters = new BehaviorSubject([]);
    this.characterId = new BehaviorSubject('');
    this.activeCharacter = new BehaviorSubject(null);
    this.activities = new BehaviorSubject([]);

    this.route.params
      .subscribe((params: Params) => {
        console.log('Sub: Params', params);
        if (params['platform']) {
          this.membershipType.next(+params['platform']);
        } else {
          this.membershipType.next(-1);
        }

        if (params['guardian']) {
          this.searchName.next(params['guardian']);
        } else {
          this.searchName.next('');
        }

        if (params['character']) {
          this.characterId.next(params['character']);
        } else {
          this.characterId.next('');
        }

        if (params['gamemode']) {
          this._activityMode.next(params['gamemode']);
        } else {
          this._activityMode.next('None');
        }

        if (params['page']) {
          this._activityPage.next(+params['page']);
        } else {
          this._activityPage.next(0);
        }
      });

    Observable.combineLatest(
      this.membershipType,
      this.searchName
    )
      .map(([platform, guardian]) => {
        if (guardian.length) {
          return 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + guardian + '/';
        } else {
          return '';
        }
      })
      .distinctUntilChanged()
      .switchMap((url) => {
        this._membershipId.next('');
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .subscribe((res: bungie.SearchDestinyPlayerResponse) => {
        console.log('Sub: SearchResponse', res);
        try {
          let Response = res.Response;
          if (Response.length === 1) {
            this._membershipId.next(Response[0].membershipId);
            this.displayName.next(Response[0].displayName);
            this.membershipType.next(Response[0].membershipType);
          }
        } catch (e) {
          console.log(e);
        }
      });

    Observable.combineLatest(
      this.membershipType,
      this._membershipId
    )
      .map(([membershipType, membershipId]) => {
        try {
          if (membershipType && membershipId) {
            return 'https://www.bungie.net/Platform/Destiny/' + membershipType + '/Account/' + membershipId + '/Summary/';
          } else {
            return '';
          }
        } catch (e) {
          return '';
        }
      })
      .distinctUntilChanged()
      .switchMap((url) => {
        this.characters.next(null);
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .subscribe((res: bungie.AccountResponse) => {
        console.log('Sub: AccountResponse', res);
        try {
          this.characters.next(res.Response.data.characters);
        } catch (e) {
          console.log(e);
        }
      });

    Observable.combineLatest(
      this.characters,
      this.characterId
    )
      .map(([characters, characterId]) => {
        let character = null;
        if (characters && characters.length) {
          if (characterId) {
            character = characters.find(function (char) {
              return char.characterBase.characterId === characterId;
            });
          } else {
            character = characters[0];
          }
        }
        return character;
      })
      .distinctUntilChanged()
      .subscribe((character: bungie.Character) => {
        console.log('Sub: ActiveCharacter', character);
        this.activeCharacter.next(character);
      });

    Observable.combineLatest(
      this.activeCharacter,
      this._activityMode,
      this._activityPage
    )
      .map(([character, mode, page]) => {
        try {
          let membershipType = character.characterBase.membershipType;
          let membershipId = character.characterBase.membershipId;
          let characterId = character.characterBase.characterId;
          this.characterId.next(characterId);
          return 'https://www.bungie.net/Platform/Destiny/Stats/ActivityHistory/'
            + membershipType + '/' + membershipId + '/' + characterId + '/?mode=' + mode + '&count=10&page=' + page;
        } catch (e) {
          return '';
        }
      })
      .distinctUntilChanged()
      .switchMap((url) => {
        this.activities.next([]);
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .subscribe((res: bungie.ActivityHistoryResponse) => {
        console.log('Sub: ActivityHistory', res);
        try {
          this.activities.next(res.Response.data.activities);
        } catch (e) {
          console.log(e);
        }
      });
  }

}

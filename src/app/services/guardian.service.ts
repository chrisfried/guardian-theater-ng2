import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Response } from '@angular/http';
import { BungieHttpService } from './bungie-http.service';
import { SettingsService } from './settings.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class GuardianService implements OnDestroy {
  private subParams: Subscription;
  private subSearch: Subscription;
  private subAccount: Subscription;
  private subCharacter: Subscription;
  private subActivityHistory: Subscription;

  private _membershipId: BehaviorSubject<string>;

  public searchName: BehaviorSubject<string>;
  public searchResults: BehaviorSubject<bungie.SearchDestinyPlayerResult[]>
  public membershipType: BehaviorSubject<number>;
  public displayName: BehaviorSubject<string>;
  public characters: BehaviorSubject<bungie.Character[]>;
  public characterId: BehaviorSubject<string>;
  public activeCharacter: BehaviorSubject<bungie.Character>;
  public activities: BehaviorSubject<gt.Activity[]>;
  public activityMode: BehaviorSubject<string>;
  public activityPage: BehaviorSubject<number>;
  public activityId: BehaviorSubject<string>;
  public noResults: BehaviorSubject<boolean>;
  public noActivities: BehaviorSubject<boolean>;

  constructor(
    private bHttp: BungieHttpService,
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this._membershipId = new BehaviorSubject('');
    this.activityMode = new BehaviorSubject('None');
    this.activityPage = new BehaviorSubject(0);

    this.searchName = new BehaviorSubject('');
    this.searchResults = new BehaviorSubject([]);
    this.membershipType = new BehaviorSubject(-1);
    this.displayName = new BehaviorSubject('');
    this.characters = new BehaviorSubject([]);
    this.characterId = new BehaviorSubject('');
    this.activeCharacter = new BehaviorSubject(null);
    this.activities = new BehaviorSubject([]);
    this.activityId = new BehaviorSubject('');
    this.noResults = new BehaviorSubject(false);
    this.noActivities = new BehaviorSubject(false);

    this.subParams = this.route.params
      .subscribe((params: Params) => {
        if (params['membershipType']) {
          this.membershipType.next(+params['membershipType']);
        } else {
          this.membershipType.next(-1);
        }

        if (params['guardian']) {
          this.searchName.next(params['guardian']);
        } else {
          this.searchName.next('');
        }

        if (params['characterId']) {
          this.characterId.next(params['characterId']);
        } else {
          this.characterId.next('');
        }

        if (params['gamemode']) {
          this.activityMode.next(params['gamemode']);
        } else {
          this.activityMode.next('None');
        }

        if (params['page']) {
          this.activityPage.next(+params['page']);
        } else {
          this.activityPage.next(0);
        }
      });

    this.subSearch = Observable.combineLatest(
      this.membershipType,
      this.searchName
    )
      .map(([platform, guardian]) => {
        if (guardian.length) {
          return 'https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/' + platform + '/' + guardian + '/';
        } else {
          return '';
        }
      })
      .distinctUntilChanged()
      .switchMap((url) => {
        this._membershipId.next('');
        this.noResults.next(false);
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .subscribe((res: bungie.SearchDestinyPlayerResponse) => {
        console.log('SearchDestinyPlayer', res);
        try {
          let Results = res.Response;
          this.settingsService.activeName.next('');
          if (Results.length === 1) {
            this._membershipId.next(Results[0].membershipId);
            this.displayName.next(Results[0].displayName);
            this.settingsService.activeName.next(Results[0].displayName);
            this.membershipType.next(Results[0].membershipType);
          }
          if (Results.length > 1) {
            this.searchResults.next(Results);
          }
          if (Results.length < 1) {
            this.noResults.next(true);
          }
        } catch (e) {
          console.log(e);
        }
      });

    this.subAccount = Observable.combineLatest(
      this.membershipType,
      this._membershipId
    )
      .map(([membershipType, membershipId]) => {
        try {
          if (membershipType && membershipId) {
            return 'https://www.bungie.net/Platform/Destiny2/' + membershipType + '/Profile/' + membershipId + '/?components=200';
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
        console.log('Profile', res);
        try {
          this.characters.next(res.Response.characters.data);
        } catch (e) {
          console.log(e);
        }
      });

    this.subCharacter = Observable.combineLatest(
      this.characters,
      this.characterId
    )
      .map(([characters, characterId]) => {
        let character = null;
        console.log('characters', characters);
        if (characters) {
          console.log('characterId', characterId)
          if (characterId) {
            character = characters[characterId]
          } else {
            character = characters[Object.keys(characters)[0]];
            console.log('character', character);
          }
        }
        return character;
      })
      .distinctUntilChanged()
      .subscribe((character: bungie.Character) => {
        console.log('character', character)
        this.activeCharacter.next(character);
      });

    this.subActivityHistory = Observable.combineLatest(
      this.activeCharacter,
      this.activityMode,
      this.activityPage
    )
      .map(([character, mode, page]) => {
        try {
          let membershipType = character.membershipType;
          let membershipId = character.membershipId;
          let characterId = character.characterId;
          this.characterId.next(characterId);
          console.log('https://www.bungie.net/Platform/Destiny2/' + membershipType + '/Account/' + membershipId
          + '/Character/' + characterId + '/Stats/Activities/?mode=' + mode + '&count=7&page=' + page);
          return 'https://www.bungie.net/Platform/Destiny2/' + membershipType + '/Account/' + membershipId
                  + '/Character/' + characterId + '/Stats/Activities/?mode=' + mode + '&count=7&page=' + page;
        } catch (e) {
          return '';
        }
      })
      .distinctUntilChanged()
      .switchMap((url) => {
        this.activities.next([]);
        this.noActivities.next(false);
        if (url.length) {
          return this.bHttp.get(url)
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
        } else {
          return Observable.empty();
        }
      })
      .subscribe((res: bungie.ActivityHistoryResponse) => {
        console.log('Activities', res);
        try {
          if (!res.Response || !res.Response.activities || !res.Response.activities.length) {
            this.noActivities.next(true);
          }
          this.activities.next(res.Response.activities);
        } catch (e) {
          console.log(e);
        }
      });
  }

  ngOnDestroy() {
    this.settingsService.activeName.next('');
    this.subParams.unsubscribe();
    this.subSearch.unsubscribe();
    this.subAccount.unsubscribe();
    this.subCharacter.unsubscribe();
    this.subActivityHistory.unsubscribe();
  }

}

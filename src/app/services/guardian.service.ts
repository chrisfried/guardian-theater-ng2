import {
  combineLatest as observableCombineLatest,
  empty as observableEmpty,
  throwError as observableThrowError,
  Observable,
  Subscription,
  BehaviorSubject
} from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { SettingsService } from './settings.service';
import {
  catchError,
  map,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';

import { gt } from '../gt.typings';
import {
  ServerResponse,
  DestinyActivityHistoryResults,
  DestinyCharacterComponent,
  DestinyProfileResponse
} from 'bungie-api-ts/destiny2';

@Injectable()
export class GuardianService implements OnDestroy {
  private subAccount: Subscription;
  private subCharacter: Subscription;
  private subActivityHistory: Subscription;

  public membershipType: BehaviorSubject<number>;
  public membershipId: BehaviorSubject<string>;
  public displayName: BehaviorSubject<string>;
  public characters: BehaviorSubject<{
    [key: string]: DestinyCharacterComponent;
  }>;
  public characterId: BehaviorSubject<string>;
  public activeCharacter: BehaviorSubject<DestinyCharacterComponent>;
  public activities: BehaviorSubject<gt.Activity[]>;
  public activityMode: BehaviorSubject<string>;
  public activityPage: BehaviorSubject<number>;
  public activityId: BehaviorSubject<string>;
  public noResults: BehaviorSubject<boolean>;
  public noActivities: BehaviorSubject<boolean>;

  constructor(
    private bHttp: BungieHttpService,
    private settingsService: SettingsService
  ) {
    this.membershipId = new BehaviorSubject('');
    this.activityMode = new BehaviorSubject('None');
    this.activityPage = new BehaviorSubject(0);

    this.membershipType = new BehaviorSubject(-1);
    this.displayName = new BehaviorSubject('');
    this.characters = new BehaviorSubject({});
    this.characterId = new BehaviorSubject('');
    this.activeCharacter = new BehaviorSubject(null);
    this.activities = new BehaviorSubject([]);
    this.activityId = new BehaviorSubject('');
    this.noResults = new BehaviorSubject(false);
    this.noActivities = new BehaviorSubject(false);

    this.subAccount = observableCombineLatest(
      this.membershipType,
      this.membershipId
    )
      .pipe(
        map(([membershipType, membershipId]) => {
          try {
            if (membershipType && membershipId) {
              return (
                'https://www.bungie.net/Platform/Destiny2/' +
                membershipType +
                '/Profile/' +
                membershipId +
                '/?components=100,200'
              );
            } else {
              return '';
            }
          } catch (e) {
            return '';
          }
        }),
        distinctUntilChanged(),
        switchMap(url => {
          this.characters.next(null);
          if (url.length) {
            return this.bHttp
              .get(url)
              .pipe(
                catchError((error: any) =>
                  observableThrowError(error.json().error || 'Server error')
                )
              );
          } else {
            return observableEmpty();
          }
        })
      )
      .subscribe((res: ServerResponse<DestinyProfileResponse>) => {
        try {
          if (res.ErrorCode !== 1) {
            this.bHttp.error.next(res);
          }
          this.displayName.next(res.Response.profile.data.userInfo.displayName);
          this.settingsService.activeName.next(
            res.Response.profile.data.userInfo.displayName
          );
          this.characters.next(res.Response.characters.data);
        } catch (e) {
          this.noResults.next(true);
          console.error(e);
        }
      });

    this.subCharacter = observableCombineLatest(
      this.characters,
      this.characterId
    )
      .pipe(
        map(([characters, characterId]) => {
          let character = null;
          if (characters) {
            if (characterId) {
              character = characters[characterId];
            } else {
              character = characters[Object.keys(characters)[0]];
            }
          }
          return character;
        }),
        distinctUntilChanged()
      )
      .subscribe((character: DestinyCharacterComponent) => {
        this.activeCharacter.next(character);
      });

    this.subActivityHistory = observableCombineLatest(
      this.activeCharacter,
      this.activityMode,
      this.activityPage
    )
      .pipe(
        map(([character, mode, page]) => {
          try {
            let membershipType = character.membershipType;
            let membershipId = character.membershipId;
            let characterId = character.characterId;
            this.characterId.next(characterId);
            return (
              'https://www.bungie.net/Platform/Destiny2/' +
              membershipType +
              '/Account/' +
              membershipId +
              '/Character/' +
              characterId +
              '/Stats/Activities/?mode=' +
              mode +
              '&count=7&page=' +
              page
            );
          } catch (e) {
            return '';
          }
        }),
        distinctUntilChanged(),
        switchMap((url: string) => {
          this.activities.next([]);
          this.noActivities.next(false);
          if (url.length) {
            return this.bHttp
              .get(url)
              .pipe(
                catchError((error: any) =>
                  observableThrowError(error.json().error || 'Server error')
                )
              );
          } else {
            return observableEmpty();
          }
        })
      )
      .subscribe((res: ServerResponse<DestinyActivityHistoryResults>) => {
        console.log(res);
        try {
          if (res.ErrorCode !== 1) {
            this.bHttp.error.next(res);
          }
          if (
            !res.Response ||
            !res.Response.activities ||
            !res.Response.activities.length
          ) {
            this.noActivities.next(true);
          }
          this.activities.next(res.Response.activities);
        } catch (e) {
          console.error(e);
        }
      });
  }

  ngOnDestroy() {
    this.settingsService.activeName.next('');
    this.subAccount.unsubscribe();
    this.subCharacter.unsubscribe();
    this.subActivityHistory.unsubscribe();
  }
}

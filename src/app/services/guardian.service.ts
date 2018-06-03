import {
  combineLatest as observableCombineLatest,
  empty as observableEmpty,
  of as observableOf,
  Observable,
  Subscription,
  BehaviorSubject,
  forkJoin as observableForkJoin
} from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { SettingsService } from './settings.service';
import {
  catchError,
  map,
  distinctUntilChanged,
  switchMap,
  mergeMap
} from 'rxjs/operators';

import { gt } from '../gt.typings';
import {
  ServerResponse,
  DestinyActivityHistoryResults,
  DestinyCharacterComponent,
  DestinyProfileResponse,
  DestinyLinkedGraphDefinition,
  DestinyCharacterResponse,
  DestinyHistoricalStatsPeriodGroup
} from 'bungie-api-ts/destiny2';
import { UserInfoCard } from 'bungie-api-ts/user';
import { Server } from 'net';

@Injectable()
export class GuardianService implements OnDestroy {
  public memberships: BehaviorSubject<
    {
      membershipType: number;
      membershipId: string;
      displayName: string;
    }[]
  >;

  public membershipType: BehaviorSubject<number>;
  public membershipId: BehaviorSubject<string>;
  public displayName: BehaviorSubject<string>;
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
    this.activities = new BehaviorSubject([]);
    this.activityId = new BehaviorSubject('');
    this.noResults = new BehaviorSubject(false);
    this.noActivities = new BehaviorSubject(false);
  }

  startAccountObservable() {
    return observableCombineLatest(this.membershipType, this.membershipId).pipe(
      distinctUntilChanged(),
      switchMap(([membershipType, membershipId]) => {
        if (membershipType && membershipId) {
          return this.getLinkedAccounts(membershipType, membershipId).pipe(
            map(res => res.Response.profiles)
          );
        } else {
          return observableEmpty();
        }
      }),
      switchMap((profiles: UserInfoCard[]) => {
        this.settingsService.activeProfiles.next(profiles);
        if (
          profiles[0] &&
          profiles[0].membershipType &&
          profiles[0].membershipId
        ) {
          return this.getProfile(
            profiles[0].membershipType,
            profiles[0].membershipId
          );
        } else {
          return observableEmpty();
        }
      }),
      map((res: ServerResponse<DestinyProfileResponse>) => {
        try {
          if (res.ErrorCode !== 1) {
            this.bHttp.error.next(res);
          }
          this.displayName.next(res.Response.profile.data.userInfo.displayName);
        } catch (e) {
          this.noResults.next(true);
          console.error(e);
        }
      })
    );
  }

  startActivityHistoryObservable() {
    return observableCombineLatest(
      this.membershipType,
      this.membershipId,
      this.activityMode,
      this.activityPage
    ).pipe(
      distinctUntilChanged(),
      switchMap(([membershipType, membershipId, mode, page]) => {
        try {
          return this.getActivitiesForAccount(
            membershipType,
            membershipId,
            mode
          ).pipe(map(res => res.slice(0 + page * 7, 7 + page * 7)));
        } catch (e) {
          return observableEmpty();
        }
      }),
      map(res => {
        try {
          if (!res || !res.length) {
            this.noActivities.next(true);
          } else {
            this.noActivities.next(false);
          }
          this.activities.next(res);
        } catch (e) {
          console.error(e);
        }
      })
    );
  }

  getLinkedAccounts(
    membershipType: number,
    membershipId: string
  ): Observable<
    ServerResponse<{
      bnetMembership: UserInfoCard;
      profiles: UserInfoCard[];
      profilesWithErrors: {
        errorCode: number;
        infoCard: UserInfoCard;
      }[];
    }>
  > {
    const url = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/LinkedProfiles/`;
    return this.bHttp.get(url);
  }

  getProfile(
    membershipType: number,
    membershipId: string
  ): Observable<ServerResponse<DestinyProfileResponse>> {
    const url = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`;
    return this.bHttp.get(url);
  }

  getCharactersForAccount(
    membershipType: number,
    membershipId: string
  ): Observable<DestinyCharacterComponent[]> {
    return this.getLinkedAccounts(membershipType, membershipId).pipe(
      switchMap(linkedAccounts => {
        return observableForkJoin(
          linkedAccounts.Response.profiles.map(profile => {
            return this.getProfile(
              profile.membershipType,
              profile.membershipId
            ).pipe(
              map(res => {
                return res.Response.characters.data;
              })
            );
          })
        );
      }),
      map(res => {
        const characters = [];
        res.forEach(characterObject => {
          for (let i = 0; i < Object.keys(characterObject).length; i++) {
            characters.push(characterObject[Object.keys(characterObject)[i]]);
          }
        });
        return characters;
      })
    );
  }

  getActivityHistoryForCharacter(
    membershipType: number,
    membershipId: string,
    characterId: string,
    mode = 'None',
    count = 250,
    page = 0
  ): Observable<ServerResponse<DestinyActivityHistoryResults>> {
    // tslint:disable-next-line:max-line-length
    const url = `https://www.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=${count}&page=${page}`;
    return this.bHttp.get(url);
  }

  getActivitiesForAccount(
    membershipType: number,
    membershipId: string,
    mode = 'None'
  ): Observable<DestinyHistoricalStatsPeriodGroup[]> {
    return this.getCharactersForAccount(membershipType, membershipId).pipe(
      switchMap(characters => {
        return observableForkJoin(
          characters.map(character => {
            return this.getActivityHistoryForCharacter(
              character.membershipType,
              character.membershipId,
              character.characterId,
              mode
            ).pipe(
              map(res => {
                return res.Response.activities;
              })
            );
          })
        );
      }),
      map(res => {
        const activities: DestinyHistoricalStatsPeriodGroup[] = [];
        res.forEach(activitiesArray => {
          try {
            activitiesArray.forEach(activity => {
              activities.push(activity);
            });
          } catch (e) {}
        });
        activities.sort(
          (a, b) => new Date(b.period).valueOf() - new Date(a.period).valueOf()
        );
        return activities;
      })
    );
  }

  ngOnDestroy() {
    this.settingsService.activeProfiles.next([]);
  }
}

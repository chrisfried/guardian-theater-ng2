import { Injectable } from '@angular/core';
import {
  DestinyActivityHistoryResults,
  DestinyCharacterComponent,
  DestinyHistoricalStatsPeriodGroup,
  DestinyProfileResponse,
  ServerResponse,
  BungieMembershipType
} from 'bungie-api-ts/destiny2';
import { UserInfoCard } from 'bungie-api-ts/user';
import { Observable, forkJoin as observableForkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BungieHttpService } from './bungie-http.service';

@Injectable()
export class GuardianService {
  constructor(private bHttp: BungieHttpService) {}

  getLinkedAccounts(
    membershipType: BungieMembershipType,
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
    const url = `https://stats.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/LinkedProfiles/`;
    return this.bHttp.get(url);
  }

  getProfile(
    membershipType: number,
    membershipId: string
  ): Observable<ServerResponse<DestinyProfileResponse>> {
    const url = `https://stats.bungie.net/Platform/Destiny2/${membershipType}/Profile/${membershipId}/?components=100,200`;
    return this.bHttp.get(url);
  }

  getEmblemHash(
    membershipType: number,
    membershipId: string
  ): Observable<number> {
    return this.getCharactersForAccount(membershipType, membershipId).pipe(
      map(characters => {
        if (characters && characters[0]) {
          return characters[0].emblemHash
        }
      })
    )
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
          if (characterObject) {
            for (let i = 0; i < Object.keys(characterObject).length; i++) {
              characters.push(characterObject[Object.keys(characterObject)[i]]);
            }
          }
        });
        try {
          characters.sort((a, b) => new Date(b.dateLastPlayed).getTime() - new Date(a.dateLastPlayed).getTime());
        } catch (e) {}
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
    const url = `https://stats.bungie.net/Platform/Destiny2/${membershipType}/Account/${membershipId}/Character/${characterId}/Stats/Activities/?mode=${mode}&count=${count}&page=${page}`;
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
}

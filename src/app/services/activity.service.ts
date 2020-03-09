import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
  DestinyPostGameCarnageReportData,
  ServerResponse
} from 'bungie-api-ts/destiny2';
import { UserInfoCard } from 'bungie-api-ts/user';
import {
  BehaviorSubject,
  Subscription,
  combineLatest as observableCombineLatest,
  empty as observableEmpty,
  throwError as observableThrowError
} from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  catchError,
  withLatestFrom,
  take
} from 'rxjs/operators';
import { gt } from '../gt.typings';
import { BungieHttpService } from './bungie-http.service';
import { SettingsService } from './settings.service';
import { TwitchService } from './twitch.service';
import { MixerService } from './mixer.service';
import { XboxService } from './xbox.service';
import { Instance } from './gtApi.service';

@Injectable()
export class ActivityService implements OnDestroy {
  private subs: Subscription[];

  // private _activityId: BehaviorSubject<string>;
  private _instanceId: BehaviorSubject<string>;
  // private _activity: BehaviorSubject<gt.Activity>;
  private _instance: BehaviorSubject<Instance>;
  private _activeProfiles: UserInfoCard[];

  public pgcr: BehaviorSubject<gt.PostGameCarnageReport>;

  constructor(
    private http: HttpClient,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService,
    private mixerService: MixerService,
    private sanitizer: DomSanitizer,
    private xboxService: XboxService,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    // this._activity = new BehaviorSubject(null);
    this._instance = new BehaviorSubject(null);
    // this._activityId = new BehaviorSubject('');
    this._instanceId = new BehaviorSubject('');
    this.pgcr = new BehaviorSubject(null);
    this.subs = [];

    this.subs.push(
      this.settingsService.activeProfiles.subscribe(
        profiles => (this._activeProfiles = profiles)
      )
    );

    this.subs.push(
      this.route.params.subscribe((params: Params) => {
        if (params['activityId']) {
          // this._activityId.next(params['activityId']);
          this._instanceId.next(params['activityId']);
        } else {
          // this._activityId.next('');
          this._instanceId.next('');
        }
      })
    );

    this.subs.push(
      //   this._activity.subscribe(activity => {
      //     if (activity) {
      //       this._activityId.next(activity.activityDetails.instanceId);
      //     }
      //   })
      this._instance.subscribe(instance => {
        if (instance) {
          this._instanceId.next(instance.instanceId);
        }
      })
    );

    this.subs.push(
      this._instanceId
        .pipe(
          map(activityId => {
            return activityId
              ? 'https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/' +
                  activityId +
                  '/'
              : '';
          }),
          distinctUntilChanged(),
          switchMap(url => {
            this.pgcr.next(null);
            if (url.length) {
              return this.bHttp.get(url);
            } else {
              return observableEmpty();
            }
          })
        )
        .subscribe((res: ServerResponse<DestinyPostGameCarnageReportData>) => {
          try {
            this.pgcr.next(res.Response);
          } catch (e) {
            console.error(e);
          }
        })
    );

    this.subs.push(
      this.pgcr.subscribe(pgcr => {
        if (pgcr) {
          try {
            let period = new Date(pgcr.period);
            pgcr.entries.forEach(entry => {
              entry.startTime =
                period.getTime() / 1000 + entry.values.startSeconds.basic.value;
              entry.stopTime =
                entry.startTime + entry.values.timePlayedSeconds.basic.value;
            });
          } catch (e) {
            console.error(e);
          }

          try {
            if (pgcr.teams) {
              pgcr.teams.forEach(team => {
                if (!team.entries) {
                  team.entries = [];
                }

                pgcr.entries.forEach(entry => {
                  if (
                    entry.values.team &&
                    entry.values.team.basic.value === team.teamId
                  ) {
                    team.entries.push(entry);
                  }
                });
              });
            }
          } catch (e) {
            console.error(e);
          }

          if (!pgcr.clips$) {
            pgcr.clips$ = new BehaviorSubject([]);
          }
          try {
            pgcr.entries.forEach(entry => {
              entry.iconUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                '//www.bungie.net' + entry.player.destinyUserInfo.iconPath
              );
            });
          } catch (e) {
            console.error(e);
          }

          pgcr.active = {
            entry: null,
            team: -1,
            fireteam: -1
          };
          let activeProfiles = this._activeProfiles;
          pgcr.entries.some(function(entry) {
            return activeProfiles.some(profile => {
              if (
                profile.membershipType ===
                  entry.player.destinyUserInfo.membershipType &&
                profile.membershipId ===
                  entry.player.destinyUserInfo.membershipId
              ) {
                pgcr.active.entry = entry;
                try {
                  pgcr.active.team = entry.values.team.basic.value;
                } catch (e) {}
                try {
                  pgcr.active.fireteam = entry.values.fireteamId.basic.value;
                } catch (e) {}
                return true;
              }
            });
          });

          pgcr.filteredClips$ = observableCombineLatest(
            pgcr.clips$,
            this.settingsService.clipLimiter
          ).pipe(
            map(([clips, limiter]: [gt.Clip[], gt.ClipLimiter]) => {
              let filteredClips = [];
              clips.forEach(clip => {
                if (pgcr.active.entry) {
                  if (
                    !limiter.self &&
                    clip.entry.player.destinyUserInfo.displayName ===
                      pgcr.active.entry.player.destinyUserInfo.displayName
                  ) {
                    return;
                  }
                  if (
                    !limiter.fireteam &&
                    clip.entry.player.destinyUserInfo.displayName !==
                      pgcr.active.entry.player.destinyUserInfo.displayName &&
                    clip.entry.values.fireteamId &&
                    clip.entry.values.fireteamId.basic.value ===
                      pgcr.active.fireteam
                  ) {
                    return;
                  }
                  if (
                    !limiter.team &&
                    clip.entry.player.destinyUserInfo.displayName !==
                      pgcr.active.entry.player.destinyUserInfo.displayName &&
                    (!clip.entry.values.fireteamId ||
                      (clip.entry.values.fireteamId &&
                        clip.entry.values.fireteamId.basic.value !==
                          pgcr.active.fireteam)) &&
                    clip.entry.values.team &&
                    clip.entry.values.team.basic.value === pgcr.active.team
                  ) {
                    return;
                  }
                  if (
                    !limiter.opponents &&
                    clip.entry.player.destinyUserInfo.displayName !==
                      pgcr.active.entry.player.destinyUserInfo.displayName &&
                    ((!clip.entry.values.team &&
                      !clip.entry.values.fireteamId) ||
                      (clip.entry.values.team &&
                        clip.entry.values.team.basic.value !==
                          pgcr.active.team))
                  ) {
                    return;
                  }
                }
                filteredClips.push(clip);
              });
              return filteredClips;
            })
          );
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  set instance(instance) {
    this._instance.next(instance);
  }
}

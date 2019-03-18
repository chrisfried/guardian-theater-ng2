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
import { PublicPartnershipDetail, UserInfoCard } from 'bungie-api-ts/user';
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
  catchError
} from 'rxjs/operators';
import { gt } from '../gt.typings';
import { BungieHttpService } from './bungie-http.service';
import { SettingsService } from './settings.service';
import { TwitchService } from './twitch.service';
import { MixerService } from './mixer.service';
import { XboxService } from './xbox.service';
import { GuardianService } from '../services/guardian.service';
import { GtBadgePipe } from 'app/pipes/gt-badge.pipe';

@Injectable()
export class ActivityService implements OnDestroy {
  private subs: Subscription[];

  private _activityId: BehaviorSubject<string>;
  private _activity: BehaviorSubject<gt.Activity>;
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
    private settingsService: SettingsService,
    private guardianService: GuardianService
  ) {
    this._activity = new BehaviorSubject(null);
    this._activityId = new BehaviorSubject('');
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
          this._activityId.next(params['activityId']);
        } else {
          this._activityId.next('');
        }
      })
    );

    this.subs.push(
      this._activity.subscribe(activity => {
        if (activity) {
          this._activityId.next(activity.activityDetails.instanceId);
        }
      })
    );

    this.subs.push(
      this._activityId
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
              let membershipId = entry.player.bungieNetUserInfo
                ? entry.player.bungieNetUserInfo.membershipId
                : entry.player.destinyUserInfo.membershipId;
              let displayName = entry.player.destinyUserInfo.displayName;
              let displayNameUndersore = displayName.split(' ').join('_');

              entry.iconUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                '//www.bungie.net' + entry.player.destinyUserInfo.iconPath
              );

              if (!this.twitchService.twitch[membershipId]) {
                this.twitchService.twitch[membershipId] = new BehaviorSubject({
                  displayName,
                  membershipId
                });
              }

              if (!this.mixerService.mixer[membershipId]) {
                this.mixerService.mixer[membershipId] = new BehaviorSubject({
                  displayName: displayNameUndersore
                });
              }

              // Check Bungie API for Twitch ID
              this.subs.push(
                this.twitchService.twitch[membershipId]
                  .pipe(
                    map((subject: gt.TwitchServiceItem) => {
                      return subject.checkedId
                        ? ''
                        : 'https://stats.bungie.net/Platform/User/' +
                            subject.membershipId +
                            '/Partnerships/';
                    }),
                    distinctUntilChanged(),
                    switchMap((url: string) => {
                      if (url.length) {
                        return this.bHttp.get(url);
                      } else {
                        return observableEmpty();
                      }
                    })
                  )
                  .subscribe(
                    (res: ServerResponse<PublicPartnershipDetail[]>) => {
                      try {
                        let next: gt.TwitchServiceItem = {
                          displayName,
                          membershipId,
                          checkedId: true
                        };
                        if (res.Response.length) {
                          next.twitchId = res.Response[0].name;
                        }
                        this.twitchService.twitch[membershipId].next(next);
                      } catch (e) {
                        console.error(e);
                      }
                    }
                  )
              );

              let twitchIdTemp = '';

              // Fetch Twitch clips based on Twitch ID from Bungie
              this.subs.push(
                this.twitchService.twitch[membershipId]
                  .pipe(
                    map((subject: gt.TwitchServiceItem) => {
                      twitchIdTemp = subject.twitchId;
                      const url =
                        subject.twitchId && !subject.checkedResponse
                          ? 'https://api.twitch.tv/kraken/channels/' +
                            subject.twitchId +
                            '/videos' +
                            '?client_id=o8cuwhl23x5ways7456xhitdm0f4th0&limit=100&offset=0&broadcast_type=archive,highlight'
                          : '';
                      return url;
                    }),
                    distinctUntilChanged(),
                    switchMap((url: string) => {
                      if (url.length) {
                        return this.http.get(url).pipe(
                          catchError((err: HttpErrorResponse) => {
                            if (err.status === 404) {
                              const next: gt.TwitchServiceItem = {
                                displayName,
                                membershipId,
                                checkedId: true,
                                twitchId: twitchIdTemp,
                                checkedResponse: true,
                                notFound: true
                              };
                              this.twitchService.twitch[membershipId].next(
                                next
                              );
                            }
                            return observableThrowError(
                              err || 'Twitch Server error'
                            );
                          })
                        );
                      } else {
                        return observableEmpty();
                      }
                    })
                  )
                  .subscribe((response: any) => {
                    if (response) {
                      const next: gt.TwitchServiceItem = {
                        displayName,
                        membershipId,
                        checkedId: true,
                        twitchId: twitchIdTemp,
                        checkedResponse: true,
                        response
                      };
                      this.twitchService.twitch[membershipId].next(next);
                    }
                  })
              );

              // Check GT API for Twitch ID
              this.subs.push(
                this.twitchService.twitch[membershipId]
                  .pipe(
                    map((subject: gt.TwitchServiceItem) => {
                      let {
                        checkedId,
                        twitchId,
                        checkedResponse,
                        notFound,
                        checkedScreenAPI
                      } = subject;
                      let url = '';
                      if (
                        !checkedScreenAPI &&
                        ((checkedId && !twitchId) ||
                          (checkedResponse && notFound))
                      ) {
                        url = `https://guardiantheater.github.io/d2-stream-name-parser/${displayName}/twitch.json`;
                      }
                      return url;
                    }),
                    switchMap(url => {
                      if (url) {
                        return this.http.get(url).pipe(
                          catchError((err: HttpErrorResponse) => {
                            if (err.status === 404) {
                              const next: gt.TwitchServiceItem = {
                                displayName,
                                membershipId,
                                checkedId: true,
                                checkedResponse: true,
                                notFound: true,
                                checkedScreenAPI: true,
                                checkedScreenResponse: true
                              };
                              this.twitchService.twitch[membershipId].next(
                                next
                              );
                            }
                            return observableEmpty();
                          })
                        );
                      } else {
                        return observableEmpty();
                      }
                    }),
                    map((res: { [key: string]: number }) => {
                      let max = 0;
                      let twitchId = '';
                      for (let id in res) {
                        if (res[id] > max) {
                          twitchId = id;
                          max = res[id];
                        }
                      }
                      if (twitchId) {
                        const next: gt.TwitchServiceItem = {
                          displayName,
                          membershipId,
                          twitchId,
                          checkedId: true,
                          checkedResponse: true,
                          checkedScreenAPI: true
                        };
                        this.twitchService.twitch[membershipId].next(next);
                      }
                    })
                  )
                  .subscribe()
              );

              // Fetch Twitch clips based on Twitch ID from GT API
              this.subs.push(
                this.twitchService.twitch[membershipId]
                  .pipe(
                    map((subject: gt.TwitchServiceItem) => {
                      let {
                        twitchId,
                        checkedScreenAPI,
                        checkedScreenResponse
                      } = subject;
                      twitchIdTemp = twitchId;
                      const url =
                        twitchId && checkedScreenAPI && !checkedScreenResponse
                          ? 'https://api.twitch.tv/kraken/channels/' +
                            twitchId +
                            '/videos' +
                            '?client_id=o8cuwhl23x5ways7456xhitdm0f4th0&limit=100&offset=0&broadcast_type=archive,highlight'
                          : '';
                      return url;
                    }),
                    distinctUntilChanged(),
                    switchMap((url: string) => {
                      if (url.length) {
                        return this.http
                          .get(url, {
                            headers: new HttpHeaders().set(
                              'Accept',
                              'application/vnd.twitchtv.v5+json'
                            )
                          })
                          .pipe(
                            catchError((err: HttpErrorResponse) => {
                              if (err.status === 404) {
                                const next: gt.TwitchServiceItem = {
                                  displayName,
                                  membershipId,
                                  checkedId: true,
                                  twitchId: twitchIdTemp,
                                  checkedResponse: true,
                                  checkedScreenAPI: true,
                                  checkedScreenResponse: true,
                                  notFound: true
                                };
                                this.twitchService.twitch[membershipId].next(
                                  next
                                );
                              }
                              return observableThrowError(
                                err || 'Twitch Server error'
                              );
                            })
                          );
                      } else {
                        return observableEmpty();
                      }
                    })
                  )
                  .subscribe((response: any) => {
                    if (response) {
                      const next: gt.TwitchServiceItem = {
                        displayName,
                        membershipId,
                        checkedId: true,
                        twitchId: twitchIdTemp,
                        checkedResponse: true,
                        checkedScreenAPI: true,
                        checkedScreenResponse: true,
                        response
                      };
                      this.twitchService.twitch[membershipId].next(next);
                    }
                  })
              );

              // Check for matching Twtich Clips
              this.subs.push(
                this.twitchService.twitch[membershipId].subscribe(
                  (subject: gt.TwitchServiceItem) => {
                    if (subject.response && subject.response._total > 0) {
                      subject.response.videos.forEach(video => {
                        let recordedStart =
                          new Date(video.recorded_at).getTime() / 1000;
                        let recordedStop = recordedStart + video.length;
                        if (recordedStart > entry.stopTime) {
                          return;
                        }
                        if (recordedStop < entry.startTime) {
                          return;
                        }
                        if (!pgcr.clips) {
                          pgcr.clips = [];
                        }
                        if (!entry.clips) {
                          entry.clips = [];
                        }
                        let offset = entry.startTime - recordedStart;
                        let hms = '0h0m0s';
                        if (offset > 0) {
                          let h = Math.floor(offset / 3600);
                          if (h > 24) {
                            console.log(
                              entry.player.destinyUserInfo.displayName,
                              'stream started more than 24 hours before activity, presumed dead'
                            );
                            return;
                          }
                          let m = Math.floor((offset % 3600) / 60);
                          let s = Math.floor((offset % 3600) % 60);
                          hms = h + 'h' + m + 'm' + s + 's';
                        }
                        let embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                          '//player.twitch.tv/?video=' +
                            video._id +
                            '&time=' +
                            hms
                        );
                        let clip: gt.Clip = {
                          type: 'twitch',
                          start: recordedStart,
                          entry: entry,
                          video: video,
                          embedUrl: embedUrl,
                          hhmmss: hms
                        };
                        entry.clips.push(clip);
                        pgcr.clips.push(clip);
                        pgcr.clips.sort(function(a, b) {
                          return a.start - b.start;
                        });
                        pgcr.clips$.next(pgcr.clips);
                      });
                    }
                  }
                )
              );

              // Check GT API for Mixer Channel ID
              this.subs.push(
                this.mixerService.mixer[membershipId]
                  .pipe(
                    map((subject: gt.MixerServiceItem) => {
                      let { checkedId } = subject;
                      let url = '';
                      if (!checkedId) {
                        url = `https://guardiantheater.github.io/d2-stream-name-parser/${displayNameUndersore}/mixer.json`;
                      }
                      return url;
                    }),
                    switchMap(url => {
                      if (url) {
                        return this.http.get(url).pipe(
                          catchError((err: HttpErrorResponse) => {
                            if (err.status === 404) {
                              const next: gt.MixerServiceItem = {
                                displayName: displayNameUndersore,
                                checkedId: true
                              };
                              this.mixerService.mixer[membershipId].next(next);
                            }
                            return observableEmpty();
                          })
                        );
                      } else {
                        return observableEmpty();
                      }
                    }),
                    map((res: { [key: string]: number }) => {
                      let max = 0;
                      let channelId = '';
                      for (let id in res) {
                        if (res[id] > max) {
                          channelId = id;
                          max = res[id];
                        }
                      }
                      if (channelId) {
                        const next: gt.MixerServiceItem = {
                          displayName: displayNameUndersore,
                          channelId,
                          checkedId: true
                        };
                        this.mixerService.mixer[membershipId].next(next);
                      }
                    })
                  )
                  .subscribe()
              );

              let channelIdTemp;

              // Fetch Twitch clips based on Mixer Channel ID from GT API
              this.subs.push(
                this.mixerService.mixer[membershipId]
                  .pipe(
                    map((subject: gt.MixerServiceItem) => {
                      let { channelId, checkedResponse } = subject;
                      channelIdTemp = channelId;
                      const url =
                        channelId && !checkedResponse
                          ? 'https://mixer.com/api/v1/channels/' +
                            channelId +
                            '/recordings?limit=100&order=createdAt:DESC'
                          : '';
                      return url;
                    }),
                    distinctUntilChanged(),
                    switchMap((url: string) => {
                      if (url.length) {
                        return this.http
                          .get(url, {
                            headers: new HttpHeaders().set(
                              'Client-ID',
                              '70eaab0506c7699b2c1800b9ce485786273c5db3b65d80c9'
                            )
                          })
                          .pipe(
                            catchError((err: HttpErrorResponse) => {
                              if (err.status === 404) {
                                const next: gt.MixerServiceItem = {
                                  displayName: displayNameUndersore,
                                  channelId: channelIdTemp,
                                  checkedId: true,
                                  checkedResponse: true
                                };
                                this.mixerService.mixer[membershipId].next(
                                  next
                                );
                              }
                              return observableThrowError(
                                err || 'Twitch Server error'
                              );
                            })
                          );
                      } else {
                        return observableEmpty();
                      }
                    })
                  )
                  .subscribe((response: any) => {
                    if (response) {
                      const next: gt.MixerServiceItem = {
                        displayName: displayNameUndersore,
                        channelId: channelIdTemp,
                        checkedId: true,
                        checkedResponse: true,
                        response
                      };
                      this.mixerService.mixer[membershipId].next(next);
                    }
                  })
              );

              // Check for matching Mixer Clips
              this.subs.push(
                this.mixerService.mixer[membershipId].subscribe(
                  (subject: gt.MixerServiceItem) => {
                    if (subject.response && subject.response.length) {
                      subject.response.forEach(video => {
                        let recordedStop =
                          new Date(video.createdAt).getTime() / 1000;
                        let recordedStart = recordedStop - video.duration;
                        if (recordedStart > entry.stopTime) {
                          return;
                        }
                        if (recordedStop < entry.startTime) {
                          return;
                        }
                        if (!pgcr.clips) {
                          pgcr.clips = [];
                        }
                        if (!entry.clips) {
                          entry.clips = [];
                        }
                        let offset = entry.startTime - recordedStart;
                        let hms = '0h0m0s';
                        if (offset > 0) {
                          let h = Math.floor(offset / 3600);
                          if (h > 24) {
                            console.log(
                              entry.player.destinyUserInfo.displayName,
                              'stream started more than 24 hours before activity, presumed dead'
                            );
                            return;
                          }
                          let m = Math.floor((offset % 3600) / 60);
                          let s = Math.floor((offset % 3600) % 60);
                          hms = h + 'h' + m + 'm' + s + 's';
                        }
                        let embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                          `https://mixer.com/embed/player/${
                            subject.displayName
                          }?vod=${video.id}&t=${offset}&disableLinks=1&hideChannel=1`
                        );
                        let vodUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                          `https://mixer.com/${
                            subject.displayName
                          }?vod=${video.id}&t=${offset}`
                        );
                        let clip: gt.Clip = {
                          type: 'mixer',
                          start: recordedStart,
                          entry,
                          video,
                          embedUrl,
                          vodUrl,
                          hhmmss: hms
                        };
                        entry.clips.push(clip);
                        pgcr.clips.push(clip);
                        pgcr.clips.sort(function(a, b) {
                          return a.start - b.start;
                        });
                        pgcr.clips$.next(pgcr.clips);
                      });
                    }
                  }
                )
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
                    (!limiter.xbox && clip.type === 'xbox') ||
                    (!limiter.twitch && clip.type === 'twitch')
                  ) {
                    return;
                  }
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

    this.subs.push(
      this.pgcr.subscribe(pgcr => {
        if (pgcr) {
          if (!pgcr.clips$) {
            pgcr.clips$ = new BehaviorSubject([]);
          }
          try {
            pgcr.entries.forEach(entry => {
              let gamertag;

              if (entry.player.destinyUserInfo.membershipType === 1) {
                gamertag = entry.player.destinyUserInfo.displayName;
                if (!this.xboxService.xbox[gamertag]) {
                  this.xboxService.xbox[gamertag] = new BehaviorSubject({
                    checked: false,
                    gamertag: gamertag,
                    response: null
                  });
                }
                this.loadXboxClips(pgcr, entry, gamertag);
              }

              // if (entry.player.destinyUserInfo.membershipType === 4) {
              //   if (
              //     !this.xboxService.xboxPC[
              //       entry.player.destinyUserInfo.displayName
              //     ]
              //   ) {
              //     this.xboxService.xboxPC[
              //       entry.player.destinyUserInfo.displayName
              //     ] = new BehaviorSubject({
              //       checked: false,
              //       gamertag: entry.player.destinyUserInfo.displayName,
              //       response: null
              //     });
              //   }

              //   this.subs.push(
              //     this.guardianService
              //       .getLinkedAccounts(
              //         entry.player.destinyUserInfo.membershipType,
              //         entry.player.destinyUserInfo.membershipId
              //       )
              //       .subscribe(res => {
              //         res.Response.profiles.some(profile => {
              //           if (profile.membershipType === 1) {
              //             gamertag = profile.displayName;
              //             return true;
              //           }
              //         });
              //         res.Response.profilesWithErrors.some(profile => {
              //           if (profile.infoCard.membershipType === 1) {
              //             gamertag = profile.infoCard.displayName;
              //             return true;
              //           }
              //         });
              //         if (gamertag) {
              //           this.loadXboxClips(
              //             pgcr,
              //             entry,
              //             gamertag,
              //             entry.player.destinyUserInfo.displayName
              //           );
              //         } else {
              //           this.xboxService.xboxPC[
              //             entry.player.destinyUserInfo.displayName
              //           ].next({
              //             checked: true,
              //             gamertag: entry.player.destinyUserInfo.displayName,
              //             response: null
              //           });
              //         }
              //       })
              //   );
              // }
            });
          } catch (e) {
            console.error(e);
          }
        }
      })
    );
  }

  loadXboxClips(pgcr, entry, gamertag, displayName?): void {
    let titleId = displayName ? 1762047744 : 144389848;
    let cache = displayName ? 'xboxPC' : 'xbox';
    displayName = displayName ? displayName : gamertag;

    this.subs.push(
      this.xboxService[cache][displayName]
        .pipe(
          map((gamer: { checked: boolean; gamertag: string; response: {} }) => {
            return !gamer.checked
              ? 'https://api.xboxrecord.us/gameclips/gamertag/' +
                  gamertag +
                  '/titleid/' +
                  titleId
              : '';
          }),
          distinctUntilChanged(),
          switchMap((url: string) => {
            if (url.length) {
              return this.http
                .get(url)
                .pipe(
                  catchError(err =>
                    observableThrowError(err || 'Xbox Clip Server error')
                  )
                );
            } else {
              return observableEmpty();
            }
          })
        )
        .subscribe(res => {
          if (res) {
            this.xboxService[cache][displayName].next({
              checked: true,
              gamertag: displayName,
              response: res
            });
          }
        })
    );

    this.subs.push(
      this.xboxService[cache][displayName].subscribe(
        (subject: {
          checked: boolean;
          gamertag: string;
          response: xbox.Response;
        }) => {
          if (
            subject.response &&
            subject.response.gameClips &&
            subject.response.gameClips.length
          ) {
            subject.response.gameClips.forEach((video: xbox.Video) => {
              let recordedStart = new Date(video.dateRecorded).getTime() / 1000;
              let recordedStop = recordedStart + video.durationInSeconds;
              if (recordedStart > entry.stopTime) {
                return;
              }
              if (recordedStop < entry.startTime) {
                return;
              }
              if (!pgcr.clips) {
                pgcr.clips = [];
              }
              if (!entry.clips) {
                entry.clips = [];
              }
              entry.clips.push({
                type: 'xbox',
                start: recordedStart,
                entry: entry,
                video: video
              });
              pgcr.clips.push({
                type: 'xbox',
                start: recordedStart,
                entry: entry,
                video: video
              });
              pgcr.clips.sort(function(a, b) {
                return a.start - b.start;
              });
              pgcr.clips$.next(pgcr.clips);
            });
          }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  set activity(activity) {
    this._activity.next(activity);
  }
}

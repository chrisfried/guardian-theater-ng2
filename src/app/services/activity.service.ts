import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TwitchService } from './twitch.service';
import { XboxService } from './xbox.service';
import { SettingsService } from './settings.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/from';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { catchError, map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ServerResponse, DestinyPostGameCarnageReportData } from 'bungie-api-ts/destiny2';
import { PublicPartnershipDetail } from 'bungie-api-ts/user'
import { gt } from '../gt.typings';

@Injectable()
export class ActivityService implements OnDestroy {
  private subs: Subscription[];

  private _activityId: BehaviorSubject<string>;
  private _activity: BehaviorSubject<gt.Activity>;
  private _activeName: string;

  public membershipType: BehaviorSubject<number>;
  public pgcr: BehaviorSubject<gt.PostGameCarnageReport>;

  constructor(
    private http: HttpClient,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService,
    private sanitizer: DomSanitizer,
    private xboxService: XboxService,
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {
    this._activity = new BehaviorSubject(null);
    this._activityId = new BehaviorSubject('');
    this.pgcr = new BehaviorSubject(null);
    this.subs = [];
    this.membershipType = new BehaviorSubject(-1);

    this.subs.push(this.settingsService.activeName
      .subscribe(
        displayName => this._activeName = displayName
      )
    );

    this.subs.push(this.route.params
      .subscribe((params: Params) => {
        if (params['membershipType']) {
          this.membershipType.next(+params['membershipType']);
        } else {
          this.membershipType.next(-1);
        }

        if (params['activityId']) {
          this._activityId.next(params['activityId']);
        } else {
          this._activityId.next('');
        }
      })
    );

    this.subs.push(
      this._activity
        .subscribe(activity => {
          if (activity) {
            this._activityId.next(activity.activityDetails.instanceId);
          }
        })
    );

    this.subs.push(
      this._activityId
        .pipe(
          map((activityId) => {
            return activityId
              ? 'https://www.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/' + activityId + '/'
              : '';
          }),
          distinctUntilChanged(),
          switchMap((url) => {
            this.pgcr.next(null);
            if (url.length) {
              return this.bHttp.get(url)
                .pipe(catchError((error: any) => Observable.throw(error.json().error || 'Server error')));
            } else {
              return Observable.empty();
            }
          })
        )
        .subscribe((res: ServerResponse<DestinyPostGameCarnageReportData>) => {
          try {
            if (res.ErrorCode !== 1) {
              this.bHttp.error.next(res);
            }
            this.pgcr.next(res.Response);
          } catch (e) {
            console.error(e);
          }
        })
    );

    this.subs.push(
      this.pgcr
        .subscribe(pgcr => {
          if (pgcr) {
            try {
              let period = new Date(pgcr.period);
              pgcr.entries.forEach(entry => {
                entry.startTime = period.getTime() / 1000 + entry.values.startSeconds.basic.value;
                entry.stopTime = entry.startTime + entry.values.timePlayedSeconds.basic.value;
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
                    if (entry.values.team && entry.values.team.basic.value === team.teamId) {
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
                if (entry.player.bungieNetUserInfo) {

                  let membershipId = entry.player.bungieNetUserInfo.membershipId;
                  let displayName = entry.player.destinyUserInfo.displayName;

                  entry.iconUrl = this.sanitizer.bypassSecurityTrustResourceUrl('//www.bungie.net' + entry.player.destinyUserInfo.iconPath);

                  if (!this.twitchService.twitch[membershipId]) {
                    this.twitchService.twitch[membershipId] = new BehaviorSubject({
                      displayName: displayName,
                      checkedId: false,
                      twitchId: '',
                      bungieId: membershipId,
                      checkedResponse: false,
                      response: null
                    });
                  }

                  this.subs.push(
                    this.twitchService.twitch[membershipId]
                      .pipe(
                        map((subject: {
                          displayName: string,
                          checkedId: boolean,
                          twitchId: string,
                          bungieId: string,
                          checkedResponse: boolean,
                          response: {}
                        }) => {
                          return subject.checkedId
                            ? ''
                            : 'https://www.bungie.net/Platform/User/' + subject.bungieId + '/Partnerships/';
                        }),
                        distinctUntilChanged(),
                        switchMap((url: string) => {
                          if (url.length) {
                            return this.bHttp.get(url)
                              .pipe(catchError((error: any) => Observable.throw(error.json().error || 'Server error')));
                          } else {
                            return Observable.empty();
                          }
                        })
                      )
                      .subscribe((res: ServerResponse<PublicPartnershipDetail[]>) => {
                        try {
                          if (res.ErrorCode !== 1) {
                            this.bHttp.error.next(res);
                          }
                          if (res.Response.length) {
                            this.twitchService.twitch[membershipId].next({
                              displayName: displayName,
                              checkedId: true,
                              twitchId: res.Response[0].name,
                              bungieId: membershipId,
                              checkedResponse: false,
                              response: null
                            });
                          } else {
                            this.twitchService.twitch[membershipId].next({
                              displayName: displayName,
                              checkedId: true,
                              twitchId: '',
                              bungieId: membershipId,
                              checkedResponse: true,
                              response: null
                            });
                          }
                        } catch (e) { console.error(e); }
                      })
                  );

                  let twitchId = '';

                  this.subs.push(
                    this.twitchService.twitch[membershipId]
                      .pipe(
                        map((subject: {
                          displayName: string,
                          checkedId: boolean,
                          twitchId: string,
                          bungieId: string,
                          checkedResponse: boolean,
                          response: {}
                        }) => {
                          twitchId = subject.twitchId;
                          return (subject.twitchId && !subject.checkedResponse)
                            ? 'https://api.twitch.tv/kraken/channels/' + subject.twitchId + '/videos'
                            + '?client_id=o8cuwhl23x5ways7456xhitdm0f4th0&limit=100&offset=0&broadcast_type=archive,highlight'
                            : '';
                        }),
                        distinctUntilChanged(),
                        switchMap((url: string) => {
                          if (url.length) {
                            return this.http.get(url)
                              .pipe(catchError((error: any) => Observable.throw(error.json().error || 'Server error')));
                          } else {
                            return Observable.empty();
                          }
                        })
                      )
                      .subscribe((res) => {
                        if (res) {
                          this.twitchService.twitch[membershipId].next({
                            displayName: displayName,
                            checkedId: true,
                            twitchId: twitchId,
                            bungieId: membershipId,
                            checkedResponse: true,
                            response: res
                          });
                        }
                      })
                  );

                  this.subs.push(
                    this.twitchService.twitch[membershipId]
                      .subscribe((subject: {
                        displayName: string,
                        checkedId: boolean,
                        twitchId: string,
                        bungieId: string,
                        checkedResponse: boolean,
                        response: twitch.Response
                      }) => {
                        if (subject.response && subject.response._total > 0) {
                          subject.response.videos.forEach(video => {
                            let recordedStart = new Date(video.recorded_at).getTime() / 1000;
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
                              let m = Math.floor(offset % 3600 / 60);
                              let s = Math.floor(offset % 3600 % 60);
                              hms = h + 'h' + m + 'm' + s + 's';
                            }
                            let embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('//player.twitch.tv/?video='
                              + video._id + '&time=' + hms);
                            let clip = {
                              type: 'twitch',
                              start: recordedStart,
                              entry: entry,
                              video: video,
                              embedUrl: embedUrl,
                              hhmmss: hms
                            };
                            entry.clips.push(clip);
                            pgcr.clips.push(clip);
                            pgcr.clips.sort(function (a, b) {
                              return a.start - b.start;
                            });
                            pgcr.clips$.next(pgcr.clips);
                          });
                        }
                      })
                  );

                }
              });
            } catch (e) {
              console.error(e);
            }

            pgcr.active = {
              entry: null,
              team: -1,
              fireteam: -1
            };
            let activeName = this._activeName;
            pgcr.entries.some(function (entry) {
              if (entry.player.destinyUserInfo.membershipType === 4) {
                activeName = activeName.split('#')[0];
              }
              if (entry.player.destinyUserInfo.displayName === activeName) {
                pgcr.active.entry = entry;
                try {
                  pgcr.active.team = entry.values.team.basic.value;
                } catch (e) { }
                try {
                  pgcr.active.fireteam = entry.values.fireteamId.basic.value;
                } catch (e) { }
                return true;
              }
            });

            pgcr.filteredClips$ = Observable.combineLatest(
              pgcr.clips$,
              this.settingsService.clipLimiter,
              this.membershipType
            )
              .pipe(
                map(([clips, limiter, membershipType]: [
                  gt.Clip[],
                  gt.ClipLimiter,
                  number
                ]) => {
                  let filteredClips = [];
                  clips.forEach(clip => {
                    if (pgcr.active.entry) {
                      if (membershipType === 1
                        && ((!limiter.xbox && clip.type === 'xbox') || (!limiter.twitch && clip.type === 'twitch'))) {
                        return;
                      }
                      if (!limiter.self
                        && clip.entry.player.destinyUserInfo.displayName === pgcr.active.entry.player.destinyUserInfo.displayName) {
                        return;
                      }
                      if (!limiter.fireteam
                        && clip.entry.player.destinyUserInfo.displayName !== pgcr.active.entry.player.destinyUserInfo.displayName
                        && clip.entry.values.fireteamId
                        && clip.entry.values.fireteamId.basic.value === pgcr.active.fireteam) {
                        return;
                      }
                      if (!limiter.team
                        && clip.entry.player.destinyUserInfo.displayName !== pgcr.active.entry.player.destinyUserInfo.displayName
                        && (!clip.entry.values.fireteamId
                          || (clip.entry.values.fireteamId
                            && clip.entry.values.fireteamId.basic.value !== pgcr.active.fireteam))
                        && clip.entry.values.team && clip.entry.values.team.basic.value === pgcr.active.team) {
                        return;
                      }
                      if (!limiter.opponents
                        && clip.entry.player.destinyUserInfo.displayName !== pgcr.active.entry.player.destinyUserInfo.displayName
                        && (!clip.entry.values.team && !clip.entry.values.fireteamId
                          || (clip.entry.values.team && clip.entry.values.team.basic.value !== pgcr.active.team))) {
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
      Observable.combineLatest(
        this.membershipType,
        this.pgcr
      )
        .subscribe(([type, pgcr]) => {
          if (type === -1 && pgcr) {
            try {
              this.membershipType.next(pgcr.entries[0].player.destinyUserInfo.membershipType);
            } catch (e) {
              console.error(e);
            }
          }
          if (type === 1 && pgcr) {
            if (!pgcr.clips$) {
              pgcr.clips$ = new BehaviorSubject([]);
            }
            try {
              pgcr.entries.forEach(entry => {

                let gamertag = entry.player.destinyUserInfo.displayName;

                if (!this.xboxService.xbox[gamertag]) {
                  this.xboxService.xbox[gamertag] = new BehaviorSubject({
                    checked: false,
                    gamertag: gamertag,
                    response: null
                  });
                }

                this.subs.push(
                  this.xboxService.xbox[gamertag]
                    .pipe(
                      map((gamer: {
                        checked: boolean,
                        gamertag: string,
                        response: {}
                      }) => {
                        return !gamer.checked && gamer.gamertag
                          ? 'https://api.xboxrecord.us/gameclips/gamertag/' + gamertag + '/titleid/144389848'
                          : '';
                      }),
                      distinctUntilChanged(),
                      switchMap((url: string) => {
                        if (url.length) {
                          return this.http.get(url)
                            .pipe(catchError((error: any) => Observable.from(error.error || 'Server error')));
                        } else {
                          return Observable.empty();
                        }
                      })
                    )
                    .subscribe((res) => {
                      if (res) {
                        this.xboxService.xbox[gamertag].next({
                          checked: true,
                          gamertag: gamertag,
                          response: res
                        });
                      }
                    })
                );

                this.subs.push(
                  this.xboxService.xbox[gamertag]
                    .subscribe((subject: {
                      checked: boolean,
                      gamertag: string,
                      response: xbox.Response
                    }) => {
                      if (subject.response && subject.response.gameClips && subject.response.gameClips.length) {
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
                          pgcr.clips.sort(function (a, b) {
                            return a.start - b.start;
                          });
                          pgcr.clips$.next(pgcr.clips);
                        });
                      }
                    })
                );

              });
            } catch (e) {
              console.error(e);
            }
          }
        })
    );

  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  set activity(activity) {
    this._activity.next(activity);
  }
}

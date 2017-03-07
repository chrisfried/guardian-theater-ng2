import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { GuardianService } from './guardian.service';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TwitchService } from './twitch.service';
import { XboxService } from './xbox.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Response } from '@angular/http';

@Injectable()
export class ActivityService implements OnDestroy {
  private subs: Subscription[];

  private _activity: BehaviorSubject<bungie.Activity>;

  public pgcr: BehaviorSubject<bungie.PostGameCarnageReport>;

  constructor(
    private http: Http,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService,
    private sanitizer: DomSanitizer,
    private guardianService: GuardianService,
    private xboxService: XboxService
  ) {
    this._activity = new BehaviorSubject(null);
    this.pgcr = new BehaviorSubject(null);
    this.subs = [];

    this.subs.push(
      this._activity
        .map((activity) => {
          if (activity) {
            return 'https://www.bungie.net/Platform/Destiny/Stats/PostGameCarnageReport/' + activity.activityDetails.instanceId + '/';
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap((url) => {
          this.pgcr.next(null);
          if (url.length) {
            return this.bHttp.get(url)
              .map((res: Response) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe(
          (res: bungie.PostGameCarnageReportResponse) => {
            try {
              this.pgcr.next(res.Response.data);
            } catch (e) {
              console.log(e);
            }
          }
        )
    );

    this.subs.push(
      this.pgcr
        .subscribe(pgcr => {
          if (pgcr) {
            try {
              let period = new Date(pgcr.period);
              pgcr.entries.forEach(entry => {
                let remainingSeconds = 0;
                try {
                  remainingSeconds = entry.extended.values.remainingTimeAfterQuitSeconds.basic.value;
                } catch (e) {}
                entry.startTime = period.getTime() / 1000
                + entry.values.activityDurationSeconds.basic.value
                - remainingSeconds
                - entry.extended.values.secondsPlayed.basic.value;
                entry.stopTime = period.getTime() / 1000
                + entry.values.activityDurationSeconds.basic.value
                - remainingSeconds;
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
    );

    this.subs.push(
      this.pgcr
        .subscribe(pgcr => {
          if (pgcr) {
            try {
              pgcr.entries.forEach(entry => {
                if (entry.player.bungieNetUserInfo) {

                  let membershipId = entry.player.bungieNetUserInfo.membershipId;

                  if (!this.twitchService.twitch[membershipId]) {
                    this.twitchService.twitch[membershipId] = new BehaviorSubject({
                      checkedId: false,
                      twitchId: '',
                      bungieId: membershipId,
                      checkedResponse: false,
                      response: null
                    });
                  }

                  this.subs.push(
                    this.twitchService.twitch[membershipId]
                      .map((subject: {
                        checkedId: boolean,
                        twitchId: string,
                        bungieId: string,
                        checkedResponse: boolean,
                        response: {}
                      }) => {
                        if (!subject.checkedId) {
                          return 'https://www.bungie.net/Platform/User/' + subject.bungieId + '/Partnerships/';
                        } else {
                          return '';
                        }
                      })
                      .distinctUntilChanged()
                      .switchMap(url => {
                        if (url.length) {
                          return this.bHttp.get(url)
                            .map((res: Response) => res.json())
                            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
                        } else {
                          return Observable.empty();
                        }
                      })
                      .subscribe((res: bungie.PartnershipResponse) => {
                        if (res.Response.length) {
                          this.twitchService.twitch[membershipId].next({
                            checkedId: true,
                            twitchId: res.Response[0].name,
                            bungieId: membershipId,
                            checkedResponse: false,
                            response: null
                          });
                        } else {
                          this.twitchService.twitch[membershipId].next({
                            checkedId: true,
                            twitchId: '',
                            bungieId: membershipId,
                            checkedResponse: true,
                            response: null
                          });
                        }
                      })
                  );

                  let twitchId = '';

                  this.subs.push(
                    this.twitchService.twitch[membershipId]
                      .map((subject: {
                        checkedId: boolean,
                        twitchId: string,
                        bungieId: string,
                        checkedResponse: boolean,
                        response: {}
                      }) => {
                        if (subject.twitchId && !subject.checkedResponse) {
                          twitchId = subject.twitchId;
                          return 'https://api.twitch.tv/kraken/channels/' + twitchId + '/videos'
                          + '?client_id=o8cuwhl23x5ways7456xhitdm0f4th0&limit=100&offset=0&broadcast_type=archive,highlight';
                        } else {
                          return '';
                        }
                      })
                      .distinctUntilChanged()
                      .switchMap(url => {
                        if (url.length) {
                          return this.http.get(url)
                            .map((res: Response) => res.json())
                            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
                        } else {
                          return Observable.empty();
                        }
                      })
                      .subscribe((res) => {
                        if (res) {
                          this.twitchService.twitch[membershipId].next({
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
                            if (!entry.twitchClips) {
                              entry.twitchClips = [];
                            }
                            let offset = entry.startTime - recordedStart;
                            let hms = '0h0m0s';
                            if (offset > 0) {
                              hms = Math.floor(offset / 3600) + 'h'
                              + Math.floor(offset % 3600 / 60) + 'm'
                              + Math.floor(offset % 3600 % 60) + 's';
                            }
                            video.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('//player.twitch.tv/?video='
                            + video._id + '&time=' + hms);
                            entry.twitchClips.push(video);
                          });
                        }
                      })
                  );

                }
              });
            } catch (e) {
              console.log(e);
            }
          }
        })
    );

    this.subs.push(
      Observable.combineLatest(
        this.guardianService.membershipType,
        this.pgcr
      )
        .subscribe(([type, pgcr]) => {
          if (type === 1 && pgcr) {
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
                  .map((gamer: {
                    checked: boolean,
                    gamertag: string,
                    response: {}
                  }) => {
                    if (!gamer.checked && gamer.gamertag) {
                      return 'https://limitless-reaches-77548.herokuapp.com/api/clips/' + gamertag;
                    } else {
                      return '';
                    }
                  })
                  .distinctUntilChanged()
                  .switchMap(url => {
                    if (url.length) {
                      return this.http.get(url)
                        .map((res: Response) => res.json())
                        .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
                    } else {
                      return Observable.empty();
                    }
                  })
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
                          if (!entry.xboxClips) {
                            entry.xboxClips = [];
                          }
                          entry.xboxClips.push(video);
                        });
                      }
                    })
                );

              });
            } catch (e) {
              console.log(e);
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

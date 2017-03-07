import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { TwitchService } from './twitch.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Response } from '@angular/http';

@Injectable()
export class ActivityService implements OnDestroy {
  private subPGCR: Subscription;
  private subTimes: Subscription;
  private subTwitch: Subscription;
  private subsTwitch: Subscription[];

  private _activity: BehaviorSubject<bungie.Activity>;

  public pgcr: BehaviorSubject<bungie.PostGameCarnageReport>;

  constructor(
    private http: Http,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService,
    private sanitizer: DomSanitizer
  ) {
    this._activity = new BehaviorSubject(null);
    this.pgcr = new BehaviorSubject(null);
    this.subsTwitch = [];

    this.subPGCR = this._activity
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
          console.log(res);
          try {
            this.pgcr.next(res.Response.data);
          } catch (e) {
            console.log(e);
          }
        }
      );

    this.subTimes = this.pgcr
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
      });

    this.subTwitch = this.pgcr
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

                this.subsTwitch.push(
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

                this.subsTwitch.push(
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

                this.subsTwitch.push(
                  this.twitchService.twitch[membershipId]
                    .map((subject: {
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
                          video.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('http://player.twitch.tv/?video='
                           + video._id + '&time=' + hms);
                          entry.twitchClips.push(video);
                        });
                      }
                    })
                    .subscribe()
                );

              }
            });
          } catch (e) {
            console.log(e);
          }
        }
      });

  }

  ngOnDestroy() {
    this.subPGCR.unsubscribe();
    this.subTimes.unsubscribe();
    this.subTwitch.unsubscribe();
    this.subsTwitch.forEach(sub => sub.unsubscribe());
  }

  set activity(activity) {
    this._activity.next(activity);
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { BungieHttpService } from './bungie-http.service';
import { TwitchService } from './twitch.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Response } from '@angular/http';

@Injectable()
export class ActivityService implements OnDestroy {
  private subPGCR: Subscription;
  private subTimes: Subscription;
  private subTwitchIds: Subscription;
  private subsTwitch: Subscription[];

  private _activity: BehaviorSubject<bungie.Activity>;

  public pgcr: BehaviorSubject<bungie.PostGameCarnageReport>;

  constructor(
    private bHttp: BungieHttpService,
    private twitchService: TwitchService
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
            console.log('Match start', period);
            pgcr.entries.forEach(entry => {
              let remainingSeconds = 0;
              try {
                remainingSeconds = entry.extended.values.remainingTimeAfterQuitSeconds.basic.value;
              } catch (e) {}
              entry.startTime = new Date(pgcr.period).setSeconds(period.getSeconds()
               + entry.values.activityDurationSeconds.basic.value
               - remainingSeconds
               - entry.extended.values.secondsPlayed.basic.value);
              entry.stopTime = new Date(pgcr.period).setSeconds(period.getSeconds()
               + entry.values.activityDurationSeconds.basic.value
               - remainingSeconds);
            });
          } catch (e) {
            console.log(e);
          }
        }
      });

    this.subTwitchIds = this.pgcr
      .subscribe(pgcr => {
        if (pgcr) {
          try {
            pgcr.entries.forEach(entry => {
              if (entry.player.bungieNetUserInfo) {
                let membershipId = entry.player.bungieNetUserInfo.membershipId;
                if (!this.twitchService.twitchIds[membershipId]) {
                  this.twitchService.twitchIds[membershipId] = new BehaviorSubject({
                    checked: false,
                    twitchId: '',
                    bungieId: membershipId
                  });
                }
                this.subsTwitch.push(
                  this.twitchService.twitchIds[membershipId]
                    .map((subject: {
                      checked: boolean,
                      twitchId: string,
                      bungieId: string
                    }) => {
                      if (!subject.checked) {
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
                        this.twitchService.twitchIds[membershipId].next({
                          checked: true,
                          twitchId: res.Response[0].name,
                          bungieId: membershipId
                        });
                      } else {
                        this.twitchService.twitchIds[membershipId].next({
                          checked: true,
                          twitchId: '',
                          bungieId: membershipId
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
      });

  }

  ngOnDestroy() {
    this.subPGCR.unsubscribe();
    this.subTimes.unsubscribe();
    this.subTwitchIds.unsubscribe();
    this.subsTwitch.forEach(sub => sub.unsubscribe());
  }

  set activity(activity) {
    this._activity.next(activity);
  }
}

import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx';
import { BungieHttpService } from '../services/bungie-http.service';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss']
})
export class FrontPageComponent implements OnInit {

  public platform$: BehaviorSubject<number>;
  public startTime: string;
  public endTime: string;

  private start$: BehaviorSubject<Date>;
  public end$: Observable<Date>;

  public players: {
    name: string,
    name$: BehaviorSubject<string>,
    displayName$: BehaviorSubject<string>,
    membershipId$: BehaviorSubject<string>,
    noResults$: BehaviorSubject<boolean>,
    multipleResults$: BehaviorSubject<boolean>,
    updateName: () => void,

    bungieId$: BehaviorSubject<string>,

    twitchId$: BehaviorSubject<string>,
    twitchResponse$: BehaviorSubject<any>,
    twitchClips$: BehaviorSubject<any[]>,

    xboxResponse$: BehaviorSubject<any>,
    xboxClips$: BehaviorSubject<any[]>,

    fetchingBungieResults$: BehaviorSubject<boolean>,
    fetchedBungieResults$: BehaviorSubject<boolean>,
    fetchingBungieId$: BehaviorSubject<boolean>,
    fetchedBungieId$: BehaviorSubject<boolean>,
    fetchingTwitchId1$: BehaviorSubject<boolean>,
    fetchedTwitchId1$: BehaviorSubject<boolean>,
    fetchingTwitchId2$: BehaviorSubject<boolean>,
    fetchedTwitchId2$: BehaviorSubject<boolean>,
    fetchingTwitchClips$: BehaviorSubject<boolean>,
    fetchedTwitchClips$: BehaviorSubject<boolean>,
    fetchingXboxClips$: BehaviorSubject<boolean>,
    fetchedXboxClips$: BehaviorSubject<boolean>,

    bungieStatus$: Observable<number>,
    twitchStatus$: Observable<number>,
    xboxStatus$: Observable<number>
  }[];

  constructor(
    private bHttp: BungieHttpService,
    private http: Http,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.platform$ = new BehaviorSubject(-1);

    let startDate = new Date();
    this.start$ = new BehaviorSubject(startDate);
    this.end$ = this.start$
      .debounceTime(0)
      .map(start => new Date(start.getTime() + 600000));

    this.startTime =
      startDate.getFullYear() + '-' +
      (startDate.getMonth() + 1 < 10 ? '0' : '') +
      (startDate.getMonth() + 1) + '-' +
      (startDate.getDate() < 10 ? '0' : '') +
      startDate.getDate() +
      'T' +
      (startDate.getHours() < 10 ? '0' : '') +
      startDate.getHours() + ':' +
      (startDate.getMinutes() < 10 ? '0' : '') +
      startDate.getMinutes();

    this.players = [];
    function Player() {
      this.name = '';
      this.name$ = new BehaviorSubject(this.name);
      this.displayName$ = new BehaviorSubject('');
      this.membershipId$ = new BehaviorSubject('');
      this.noResults$ = new BehaviorSubject(false);
      this.multipleResults$ = new BehaviorSubject(false);
      this.updateName = function () {
        this.name$.next(this.name);
      }

      this.bungieId$ = new BehaviorSubject('');

      this.twitchId$ = new BehaviorSubject('');
      this.twitchResponse$ = new BehaviorSubject(null);
      this.twitchClips$ = new BehaviorSubject([]);

      this.xboxResponse$ = new BehaviorSubject(null);
      this.xboxClips$ = new BehaviorSubject([]);

      this.fetchingBungieResults$ = new BehaviorSubject(false);
      this.fetchedBungieResults$ = new BehaviorSubject(false);
      this.fetchingBungieId$ = new BehaviorSubject(false);
      this.fetchedBungieId$ = new BehaviorSubject(false);
      this.fetchingTwitchId1$ = new BehaviorSubject(false);
      this.fetchedTwitchId1$ = new BehaviorSubject(false);
      this.fetchingTwitchId2$ = new BehaviorSubject(false);
      this.fetchedTwitchId2$ = new BehaviorSubject(false);
      this.fetchingTwitchClips$ = new BehaviorSubject(false);
      this.fetchedTwitchClips$ = new BehaviorSubject(false);
      this.fetchingXboxClips$ = new BehaviorSubject(false);
      this.fetchedXboxClips$ = new BehaviorSubject(false);

      this.bungieStatus$ = Observable.of(1);
      this.twitchStatus$ = Observable.of(1);
      this.xboxStatus$ = Observable.of(0);
    }

    for (let i = 0; i < 8; i++) {
      this.players.push(new Player());
    }

    this.players.forEach(player => {
      Observable.combineLatest(player.name$, this.platform$)
        .distinctUntilChanged()
        .map(([guardian, platform]) => {
          player.displayName$.next('');
          player.membershipId$.next('');
          player.noResults$.next(false);
          player.multipleResults$.next(false);

          player.bungieId$.next('');

          player.twitchId$.next('');
          player.twitchResponse$.next(null);
          player.twitchClips$.next([]);

          player.xboxResponse$.next(null);
          player.xboxClips$.next([]);

          player.fetchingBungieResults$.next(false);
          player.fetchedBungieResults$.next(false);
          player.fetchingBungieId$.next(false);
          player.fetchedBungieId$.next(false);
          player.fetchingTwitchId1$.next(false);
          player.fetchedTwitchId1$.next(false);
          player.fetchingTwitchId2$.next(false);
          player.fetchedTwitchId2$.next(false);
          player.fetchingTwitchClips$.next(false);
          player.fetchedTwitchClips$.next(false);
          player.fetchingXboxClips$.next(false);
          player.fetchedXboxClips$.next(false);

          if (guardian.length) {
            player.fetchingBungieResults$.next(true);
            return 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/' + platform + '/' + guardian + '/';
          } else {
            return '';
          }
        })
        .switchMap((url) => {
          if (url.length) {
            return this.bHttp.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res: bungie.SearchDestinyPlayerResponse) => {
          console.log('Searched Bungie for', player.name);
          player.fetchingBungieResults$.next(false);
          player.fetchedBungieResults$.next(true);
          try {
            let Response = res.Response;
            if (Response.length > 0) {
              player.membershipId$.next(Response[0].membershipId);
              player.displayName$.next(Response[0].displayName);
              player.name = Response[0].displayName;
            }
            if (Response.length > 1) {
              player.multipleResults$.next(true);
            }
            if (Response.length < 1) {
              player.noResults$.next(true);
            }
          } catch (e) { }
        });

      Observable.combineLatest(player.membershipId$, this.platform$)
        .map(([membershipId, platform]) => {
          player.fetchedTwitchId1$.next(false);
          if (membershipId) {
            player.fetchingTwitchId1$.next(true);
            return 'https://www.bungie.net/Platform/CommunityContent/Live/Users/1/' + platform + '/' + membershipId + '/';
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap(url => {
          if (url.length) {
            return this.bHttp.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res: bungie.PartnershipResponse) => {
          player.fetchingTwitchId1$.next(false);
          player.fetchedTwitchId1$.next(true);
          try {
            console.log('Found TwitchId for', player.name);
            player.twitchId$.next(res.Response.partnershipIdentifier);
          } catch (e) { }
        });

      Observable.combineLatest(player.membershipId$, this.platform$)
        .map(([membershipId, platform]) => {
          player.fetchedBungieId$.next(false);
          if (membershipId) {
            player.fetchingBungieId$.next(true);
            return 'https://www.bungie.net/Platform/User/GetBungieAccount/' + membershipId + '/' + platform + '/';
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap(url => {
          if (url.length) {
            return this.bHttp.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res) => {
          player.fetchingBungieId$.next(false);
          player.fetchedBungieId$.next(true);
          try {
            console.log('Found BungieId for', player.name);
            player.bungieId$.next(res.Response.bungieNetUser.membershipId);
          } catch (e) { }
        });

      player.bungieId$
        .map(bungieId => {
          player.fetchedTwitchId2$.next(false);
          if (bungieId) {
            player.fetchingTwitchId2$.next(true);
            return 'https://www.bungie.net/Platform/User/' + bungieId + '/Partnerships/';
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap(url => {
          if (url.length) {
            return this.bHttp.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res) => {
          player.fetchingTwitchId2$.next(false);
          player.fetchedTwitchId2$.next(true);
          try {
            console.log('Found TwitchId for', player.name);
            player.twitchId$.next(res.Response[0].identifier);
          } catch (e) { }
        });

      player.twitchId$
        .map((twitchId) => {
          player.fetchedTwitchClips$.next(false);
          if (twitchId) {
            return 'https://api.twitch.tv/kraken/channels/' + twitchId + '/videos'
              + '?client_id=o8cuwhl23x5ways7456xhitdm0f4th0&limit=100&offset=0&broadcast_type=archive,highlight';
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap(url => {
          if (url.length) {
            player.fetchingTwitchClips$.next(true);
            return this.http.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res) => {
          player.fetchingTwitchClips$.next(false);
          player.fetchedTwitchClips$.next(true);
          try {
            console.log('Retrieved Twitch clips for', player.name);
            player.twitchResponse$.next(res);
          } catch (e) { }
        });

      Observable.combineLatest(player.twitchResponse$, this.start$, this.end$)
        .subscribe(([res, start, end]) => {
          player.twitchClips$.next([]);
          if (res && res._total > 0 && start && start.getTime() > 0) {
            console.log('Checked Twitch clip timestamps for', player.name)
            let clips = [];
            let startTime = start.getTime() / 1000;
            let stopTime = end.getTime() / 1000;
            res.videos.forEach(video => {
              let recordedStart = new Date(video.recorded_at).getTime() / 1000;
              let recordedStop = recordedStart + video.length;
              if (recordedStart > stopTime) {
                return;
              }
              if (recordedStop < startTime) {
                return;
              }
              let offset = startTime - recordedStart;
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
                video: video,
                embedUrl: embedUrl,
                hhmmss: hms
              };
              clips.push(clip);
            });
            clips.sort(function (a, b) {
              return a.start - b.start;
            });
            player.twitchClips$.next(clips);
          }
        });

      Observable.combineLatest(this.platform$, player.displayName$)
        .map(([platform, displayName]) => {
          player.fetchedXboxClips$.next(false);
          if (platform === 1 && displayName.length) {
            player.fetchingXboxClips$.next(true);
            return 'https://api.guardian.theater/api/clips/' + displayName;
          } else {
            return '';
          }
        })
        .distinctUntilChanged()
        .switchMap(url => {
          if (url.length) {
            return this.http.get(url)
              .map((res) => res.json())
              .catch((error: any) => Observable.from(error.error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res) => {
          player.fetchingXboxClips$.next(false);
          player.fetchedXboxClips$.next(true);
          try {
            player.xboxResponse$.next(res);
          } catch (e) { }
        });

      Observable.combineLatest(player.xboxResponse$, this.start$, this.end$)
        .subscribe(([res, start, end]) => {
          if (res && res.gameClips && start && start.getTime() > 0) {
            console.log('Checked Xbox clip timestamps for', player.name)
            player.xboxClips$.next([]);
            let clips = [];
            let startTime = start.getTime() / 1000;
            let stopTime = end.getTime() / 1000;
            res.gameClips.forEach((video: xbox.Video) => {
              let recordedStart = new Date(video.dateRecorded).getTime() / 1000;
              let recordedStop = recordedStart + video.durationInSeconds;
              if (recordedStart > stopTime) {
                return;
              }
              if (recordedStop < startTime) {
                return;
              }
              clips.push({
                type: 'xbox',
                start: recordedStart,
                video: video
              });
            });
            clips.sort(function (a, b) {
              return a.start - b.start;
            });
            player.xboxClips$.next(clips);
          }
        });

      player.bungieStatus$ = Observable.combineLatest(
        player.fetchingBungieResults$,
        player.fetchingTwitchId1$,
        player.fetchingBungieId$,
        player.fetchingTwitchId2$,
        player.membershipId$
      )
      .map(([fB, fT1, fBi, fT2, mId]) => {
        // States:
        //   1 - Gray
        //   2 - GraySearching
        //   3 - Color
        //   4 - ColorSearching
        if (mId && (fT1 || fBi || fT2)) {
          return 4;
        } else if (mId) {
          return 3;
        } else if (fB) {
          return 2;
        } else {
          return 1;
        }
      });

      player.twitchStatus$ = Observable.combineLatest(
        player.fetchingTwitchId1$,
        player.fetchingBungieId$,
        player.fetchingTwitchId2$,
        player.twitchId$,
        player.fetchingTwitchClips$
      )
      .map(([fT1, fBi, fT2, tId, fT]) => {
        // States:
        //   1 - Gray
        //   2 - GraySearching
        //   3 - Color
        //   4 - ColorSearching
        if (tId && fT) {
          return 4;
        } else if (tId) {
          return 3;
        } else if (fT1 || fBi || fT2) {
          return 2;
        } else {
          return 1;
        }
      });

      player.xboxStatus$ = Observable.combineLatest(
        this.platform$,
        player.displayName$,
        player.fetchingXboxClips$
      )
      .map(([p, dN, fX]) => {
        // States:
        //   0 - Hidden
        //   1 - Gray
        //   2 - Color
        //   3 - ColorSearching
        if (p === 1) {
          if (dN && fX) {
            return 3;
          } else if (dN) {
            return 2;
          } else {
            return 1;
          }
        } else {
          return 0;
        }
      });

    });
  }

  selectPlatform(platform: number) {
    this.platform$.next(platform);
  }

  updateStart() {
    if (this.startTime) {
      this.start$.next(new Date(this.startTime));
    }
  }

}

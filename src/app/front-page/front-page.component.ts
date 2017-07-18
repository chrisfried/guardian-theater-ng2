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
    fetchingBungieResults$: BehaviorSubject<boolean>,
    membershipId$: BehaviorSubject<string>,
    noResults$: BehaviorSubject<boolean>,
    multipleResults$: BehaviorSubject<boolean>,
    displayName$: BehaviorSubject<string>,
    updateName: () => void,
    checkingTwitchId$: BehaviorSubject<boolean>,
    twitchIdChecked$: BehaviorSubject<boolean>,
    twitchId$: BehaviorSubject<string>,
    twitchResponseChecked$: BehaviorSubject<boolean>,
    twitchResponse$: BehaviorSubject<any>,
    twitchClips$: BehaviorSubject<any[]>,
    xboxResponse$: BehaviorSubject<any>,
    xboxClips$: BehaviorSubject<any[]>
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
      this.fetchingBungieResults$ = new BehaviorSubject(false);
      this.membershipId$ = new BehaviorSubject('');
      this.noResults$ = new BehaviorSubject(false);
      this.multipleResults$ = new BehaviorSubject(false);
      this.displayName$ = new BehaviorSubject('');
      this.checkingTwitchId$ = new BehaviorSubject(false);
      this.twitchIdChecked$ = new BehaviorSubject(false);
      this.twitchId$ = new BehaviorSubject('');
      this.twitchResponseChecked$ = new BehaviorSubject(false);
      this.twitchResponse$ = new BehaviorSubject(null);
      this.twitchClips$ = new BehaviorSubject([]);
      this.xboxResponse$ = new BehaviorSubject(null);
      this.xboxClips$ = new BehaviorSubject([]);
      this.updateName = function () {
        this.name$.next(this.name);
      }
    }

    for (let i = 0; i < 8; i++) {
      this.players.push(new Player());
    }

    this.players.forEach(player => {
      Observable.combineLatest(player.name$, this.platform$)
        .distinctUntilChanged()
        .map(([guardian, platform]) => {
          player.fetchingBungieResults$.next(true);
          player.membershipId$.next('');
          player.displayName$.next('');
          if (guardian.length) {
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

      Observable.combineLatest(player.twitchIdChecked$, player.membershipId$, this.platform$)
        .map(([checked, membershipId, platform]) => {
          if (!checked && membershipId) {
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
          player.checkingTwitchId$.next(false);
          if (res.Response && res.Response.partnershipIdentifier) {
            console.log('Found TwitchID for', player.name);
            player.twitchId$.next(res.Response.partnershipIdentifier);
            player.twitchResponseChecked$.next(false);
            player.twitchResponse$.next(null);
            player.twitchIdChecked$.next(true);
          } else {
            player.twitchId$.next('');
            player.twitchResponseChecked$.next(true);
            player.twitchResponse$.next(null);
            player.twitchIdChecked$.next(true);
          }
        });

      Observable.combineLatest(player.twitchId$, player.twitchResponseChecked$)
        .map(([twitchId, responseChecked]) => {
          if (twitchId && !responseChecked) {
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
              .map((res) => res.json())
              .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
          } else {
            return Observable.empty();
          }
        })
        .subscribe((res) => {
          if (res) {
            console.log('Retrieved Twitch clips for', player.name);
            player.twitchResponse$.next(res);
            player.twitchResponseChecked$.next(true);
          }
        });

      Observable.combineLatest(player.twitchResponse$, this.start$, this.end$)
        .subscribe(([res, start, end]) => {
          console.log(start);
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
          if (platform === 1 && displayName.length) {
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
          if (res) {
            player.xboxResponse$.next(res);
          }
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
        })
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

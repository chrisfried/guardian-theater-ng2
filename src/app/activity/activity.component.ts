import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { BungieHttpService } from '../services/bungie-http.service';
import { TwitchService } from '../services/twitch.service';
import { XboxService } from '../services/xbox.service';
import { SettingsService } from '../services/settings.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  providers: [
    ActivityService
  ]
})
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() activity: gt.Activity;

  private subs: Subscription[];

  public pgcr: gt.PostGameCarnageReport;
  public membershipType: number;
  public clips: gt.Clip[];
  public filteredClips: gt.Clip[];
  public links: gt.Links;

  constructor(
    private activityService: ActivityService,
    public twitchService: TwitchService,
    private xboxService: XboxService,
    private router: Router,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.filteredClips = [];
    this.clips = [];
    this.links = {guardian: {}, activity: {}, xbox: {}};

    this.activityService.activity = this.activity;
    this.subs = [];
    this.subs.push(this.settingsService.links
      .subscribe(links => this.links = links));
    this.subs.push(this.activityService.membershipType
      .subscribe(membershipType => this.membershipType = membershipType));
    this.subs.push(this.activityService.pgcr
      .subscribe((pgcr: gt.PostGameCarnageReport) => {
        this.pgcr = pgcr;
        if (pgcr && !pgcr.loading) {
          pgcr.loading = {
            message: '',
            xbox: false,
            twitch: false,
            bungie: false
          };
        }
        if (this.pgcr) {
          this.subs.push(this.pgcr.filteredClips$.subscribe(clips => this.filteredClips = clips));
          this.subs.push(this.pgcr.clips$.subscribe(clips => this.clips = clips));
          pgcr.showClips = true;
          let loadingArray = [];
          this.pgcr.entries.forEach(entry => {
            if (entry.player.bungieNetUserInfo && this.twitchService.twitch[entry.player.bungieNetUserInfo.membershipId]) {
              loadingArray.push(this.twitchService.twitch[entry.player.bungieNetUserInfo.membershipId]);
              this.subs.push(
                this.twitchService.twitch[entry.player.bungieNetUserInfo.membershipId]
                  .subscribe(twitch => entry.twitch = twitch)
              );
            }
            if (this.membershipType === 1 && this.xboxService.xbox[entry.player.destinyUserInfo.displayName]) {
              loadingArray.push(this.xboxService.xbox[entry.player.destinyUserInfo.displayName]);
              this.subs.push(
                this.xboxService.xbox[entry.player.destinyUserInfo.displayName]
                  .subscribe(xbox => entry.xbox = xbox)
              );
            }
          });
          if (pgcr.activityDetails.mode === 39 || pgcr.activityDetails.mode === 41 || pgcr.activityDetails.mode === 42) {
            this.pgcr.teams.forEach(team => {
              team.trialsLink = 'https://trials.report/' + (team.entries[0].player.destinyUserInfo.membershipType === 1 ? 'xbox' : 'ps');
              team.entries.forEach(entry => {
                team.trialsLink += '/' + entry.player.destinyUserInfo.displayName;
              });
            });
          }
          this.subs.push(
            Observable.combineLatest(loadingArray)
              .subscribe(
                array => {
                  let loading = {
                    message: '',
                    bungie: false,
                    xbox: false,
                    twitch: false
                  };
                  array.some(function(item) {
                    if (item.bungieId && !item.checkedId) {
                      loading.message = 'Fetching Twitch username for ' + item.displayName + '...';
                      return true;
                    }
                    if (item.bungieId && !item.checkedResponse) {
                      loading.message = 'Fetching Twitch videos for ' + item.displayName + '...';
                      return true;
                    }
                    if (item.gamertag && !item.checked) {
                      loading.message = 'Fetching Xbox clips for ' + item.gamertag + '...';
                      return true;
                    }
                  });
                  array.some(function(item) {
                    if (item.bungieId && !item.checkedId) {
                      return loading.bungie = true;
                    }
                  });
                  array.some(function(item) {
                    if (item.bungieId && !item.checkedResponse) {
                      return loading.twitch = true;
                    }
                  });
                  array.some(function(item) {
                    if (item.gamertag && !item.checked) {
                      return loading.xbox = true;
                    }
                  });
                  pgcr.loading = loading;
                }
              )
          );
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  toActivity(activityId) {
    this.router.navigate([
      '/activity', this.membershipType, activityId
    ]);
  }

  toGuardian(membershipId, characterId) {
    this.router.navigate([
      '/guardian', this.membershipType, membershipId, characterId, 'None', 0
    ]);
  }

  toClip(pgcr: gt.PostGameCarnageReport, clip) {
    this.router.navigate([
      '/activity',
      clip.entry.player.destinyUserInfo.membershipType,
      pgcr.activityDetails.instanceId,
      clip.entry.characterId,
      clip.video.gameClipId
    ]);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  route(route: any[]) {
    this.router.navigate(route);
  }
}

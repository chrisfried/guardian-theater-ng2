import { combineLatest as observableCombineLatest, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { TwitchService } from '../services/twitch.service';
import { XboxService } from '../services/xbox.service';
import { SettingsService } from '../services/settings.service';
import { Router } from '@angular/router';
import { gt } from '../gt.typings';
import { GuardianService } from '../services/guardian.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  providers: [ActivityService, GuardianService],
  animations: [
    trigger('growInShrinkOut', [
      transition('void => *', [
        style({ height: 0 }),
        animate('600ms ease-out', style({ height: '*' }))
      ]),
      transition('* => void', [
        style({ height: '*' }),
        animate('300ms ease-in', style({ height: 0 }))
      ])
    ])
  ]
})
export class ActivityComponent implements OnInit, OnDestroy {
  @Input() activity: gt.Activity;

  private subs: Subscription[];

  public pgcr: gt.PostGameCarnageReport;
  public clips: gt.Clip[];
  public filteredClips: gt.Clip[];
  public links: gt.Links;
  public mini: boolean;
  public animationState;

  constructor(
    private activityService: ActivityService,
    public twitchService: TwitchService,
    private xboxService: XboxService,
    private router: Router,
    public settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.filteredClips = [];
    this.clips = [];
    this.links = { guardian: {}, activity: {}, xbox: {} };
    this.mini = false;
    this.animationState = 'in';

    this.activityService.activity = this.activity;
    this.subs = [];
    this.subs.push(
      this.settingsService.links.subscribe(links => (this.links = links))
    );
    this.subs.push(
      this.activityService.pgcr.subscribe((pgcr: gt.PostGameCarnageReport) => {
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
          this.subs.push(
            this.pgcr.filteredClips$.subscribe(
              clips => (this.filteredClips = clips)
            )
          );
          this.subs.push(
            this.pgcr.clips$.subscribe(clips => (this.clips = clips))
          );
          pgcr.showClips = true;
          let loadingArray = [];
          this.pgcr.entries.forEach(entry => {
            if (
              entry.player.bungieNetUserInfo &&
              this.twitchService.twitch[
                entry.player.bungieNetUserInfo.membershipId
              ]
            ) {
              loadingArray.push(
                this.twitchService.twitch[
                  entry.player.bungieNetUserInfo.membershipId
                ]
              );
              this.subs.push(
                this.twitchService.twitch[
                  entry.player.bungieNetUserInfo.membershipId
                ].subscribe(twitch => (entry.twitch = twitch))
              );
            }
            if (
              entry.player.destinyUserInfo.membershipType === 1 &&
              this.xboxService.xbox[entry.player.destinyUserInfo.displayName]
            ) {
              loadingArray.push(
                this.xboxService.xbox[entry.player.destinyUserInfo.displayName]
              );
              this.subs.push(
                this.xboxService.xbox[
                  entry.player.destinyUserInfo.displayName
                ].subscribe(xbox => (entry.xbox = xbox))
              );
            }
            if (
              entry.player.destinyUserInfo.membershipType === 4 &&
              this.xboxService.xboxPC[entry.player.destinyUserInfo.displayName]
            ) {
              loadingArray.push(
                this.xboxService.xboxPC[
                  entry.player.destinyUserInfo.displayName
                ]
              );
              this.subs.push(
                this.xboxService.xboxPC[
                  entry.player.destinyUserInfo.displayName
                ].subscribe(xbox => (entry.xbox = xbox))
              );
            }
            switch (entry.player.destinyUserInfo.membershipType) {
              case 1:
                entry.trn = 'xbl';
                break;
              case 2:
                entry.trn = 'psn';
                break;
              case 4:
                entry.trn = 'pc';
                break;
            }
          });
          this.subs.push(
            observableCombineLatest(loadingArray).subscribe(array => {
              let loading = {
                message: '',
                bungie: false,
                xbox: false,
                xboxPC: false,
                twitch: false
              };
              array.some(function(item) {
                if (item.bungieId && !item.checkedId) {
                  loading.message =
                    'Fetching Twitch username for ' + item.displayName + '...';
                  return true;
                }
                if (item.bungieId && !item.checkedResponse) {
                  loading.message =
                    'Fetching Twitch videos for ' + item.displayName + '...';
                  return true;
                }
                if (item.gamertag && !item.checked) {
                  loading.message =
                    'Fetching Xbox clips for ' + item.gamertag + '...';
                  return true;
                }
              });
              array.some(function(item) {
                if (item.bungieId && !item.checkedId) {
                  return (loading.bungie = true);
                }
              });
              array.some(function(item) {
                if (item.bungieId && !item.checkedResponse) {
                  return (loading.twitch = true);
                }
              });
              array.some(function(item) {
                if (item.gamertag && !item.checked) {
                  return (loading.xbox = true);
                }
              });
              pgcr.loading = loading;
            })
          );
        }
      })
    );
  }

  ngOnDestroy() {
    this.animationState = '';
    this.subs.forEach(sub => sub.unsubscribe());
  }

  toActivity(activityId) {
    this.router.navigate(['/activity', activityId]);
  }

  toGuardian(membershipType, membershipId) {
    this.router.navigate([
      '/guardian',
      membershipType,
      membershipId,
      'None',
      0
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

@Component({
  selector: 'app-pgcr-entry',
  templateUrl: './pgcr-entry.component.html',
  styleUrls: ['./activity.component.scss']
})
export class PgcrEntryComponent {
  @Input() pgcr: gt.PostGameCarnageReport;
  @Input() entry: gt.Entry;
  @Input() links: gt.Links;

  constructor(private router: Router) {}

  toGuardian(membershipType, membershipId) {
    this.router.navigate([
      '/guardian',
      membershipType,
      membershipId,
      'None',
      0
    ]);
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  route(route: any[]) {
    this.router.navigate(route);
  }
}

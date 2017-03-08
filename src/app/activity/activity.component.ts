import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { BungieHttpService } from '../services/bungie-http.service';
import { TwitchService } from '../services/twitch.service';
import { XboxService } from '../services/xbox.service';
import { Subscription, Observable } from 'rxjs/Rx';
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
  @Input() activity: bungie.Activity;

  private subs: Subscription[];

  public pgcr: bungie.PostGameCarnageReport;
  public membershipType: number;

  constructor(
    private activityService: ActivityService,
    private bHttp: BungieHttpService,
    private twitchService: TwitchService,
    private xboxService: XboxService,
    private router: Router
  ) { }

  ngOnInit() {
    this.activityService.activity = this.activity;
    this.subs = [];
    this.subs.push(this.activityService.membershipType
      .subscribe(membershipType => this.membershipType = membershipType)
    );
    this.subs.push(this.activityService.pgcr
      .subscribe((pgcr: bungie.PostGameCarnageReport) => {
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

  toGuardian(displayName, characterId) {
    this.router.navigate([
      '/guardian', displayName, this.membershipType, characterId
    ]);
  }

}

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivityService } from '../services/activity.service';
import { BungieHttpService } from '../services/bungie-http.service';
import { TwitchService } from '../services/twitch.service';
import { XboxService } from '../services/xbox.service';
import { Subscription } from 'rxjs/Rx';
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

  private subPGCR: Subscription;
  private subMembershipType: Subscription;

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
    this.subPGCR = this.activityService.pgcr
      .subscribe((pgcr: bungie.PostGameCarnageReport) => this.pgcr = pgcr);
    this.subMembershipType = this.activityService.membershipType
      .subscribe(membershipType => this.membershipType = membershipType);
  }

  ngOnDestroy() {
    this.subPGCR.unsubscribe();
    this.subMembershipType.unsubscribe();
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
